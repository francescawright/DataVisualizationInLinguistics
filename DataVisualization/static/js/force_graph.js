// Variable to check if the ready function code has been completely executed
var codeReady = false;

//Graph
var canvasHeight = 1000, canvasWidth = document.getElementById("tree-container").offsetWidth; //Dimensions of our canvas (grayish area)
const canvasFactor = 1;
let link, node;

//Zoom
const minZoom = 0.05, maxZoom = 8; //Zoom range
let currentZoomScale; //Current scale
const initialZoomScale = 0.1; //Initial zoom scale to display almost the whole graph


//Node radius
const minNodeRadius = 30;
const incrementRadiusFactorPerChild = 5;
const dotRadius = 15;

var targetImagesPath = ["icons/Group.svg", "icons/Person.svg", "icons/Stereotype.svg", "icons/Blank.png"];
var toxicityLevelsPath = ["Level0.png", "Level1.png", "Level2.png", "Level3.png"];

/* Colours
 * */
const colourConstructiveness = "#90F6B2", colourArgumentation = "#1B8055", colourSarcasm = "#97CFFF",
    colourMockery = "#1795FF",
    colourIntolerance = "#0B5696", colourImproper = "#E3B7E8", colourInsult = "#A313B3",
    colourAggressiveness = "#5E1566";

var colorFeature = ["#90F6B2", "#1B8055",
    "#97CFFF", "#1795FF", "#0B5696",
    "#E3B7E8", "#A313B3", "#5E1566"
];
var colourBothStances = "#FFA500",
    colourPositiveStance = "#77dd77",
    colourNegativeStance = "#ff6961",
    colourNeutralStance = "#2b2727";

var colourToxicity0 = "#f7f7f7",
    colourToxicity1 = "#cccccc",
    colourToxicity2 = "#737373",
    colourToxicity3 = "#000000",
    colourNewsArticle = "lightsteelblue",
    colourCollapsed1Son = "lightsteelblue";

/**
 * Set edge stroke width based on current zoom value
 * */
function getEdgeStrokeWidth() {
    //console.log("Zoom: ", currentZoomScale)
    switch (true) {
        case (currentZoomScale > 7):
            return 1
        case (currentZoomScale > 6):
            return 2
        case (currentZoomScale > 4):
            return 3
        case (currentZoomScale > 3):
            return 4
        case (currentZoomScale > 1):
            return 5
        case (currentZoomScale > 0.6):
            return 6
        case (currentZoomScale > 0.5):
            return 7
        case (currentZoomScale > 0.4):
            return 8
        case (currentZoomScale > 0.3):
            return 9
        case (currentZoomScale > 0.2):
            return 10
        case (currentZoomScale > 0.1):
            return 11
        case (currentZoomScale > 0.075):
            return 15
        case (currentZoomScale > 0):
            return 20
    }
}

function getNodeStrokeWidth() {
    //console.log("Zoom: ", currentZoomScale)
    switch (true) {
        case (currentZoomScale > 1):
            return 4
        case (currentZoomScale > 0.6):
            return 4
        case (currentZoomScale > 0.5):
            return 5
        case (currentZoomScale > 0.4):
            return 5
        case (currentZoomScale > 0.3):
            return 6
        case (currentZoomScale > 0.2):
            return 6
        case (currentZoomScale > 0.1):
            return 8
        case (currentZoomScale > 0.075):
            return 8
        case (currentZoomScale > 0):
            return 10
    }
}


/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadius(d, edgeLength = 500) {
    /*
        If node has children,
        more than 2: new radius = 16 + 3 * (#children - 2)
        2 children: new radius = 16
        1 child: new radius = 13
        0 children: new radius = 40
    */

    d.radius = minNodeRadius;
    if ((d.children === undefined || d.children === null) && (d._children === undefined || d._children === null)) return d.radius; //If no children, radius = 40

    let children = d.children ?? d._children; //Assign children collapsed or not


    children.length > 2 ? d.radius = minNodeRadius + incrementRadiusFactorPerChild * children.length // more than 2 children
        : children.length === 2 ? d.radius = minNodeRadius + incrementRadiusFactorPerChild * 2 //2 children
            : d.radius = minNodeRadius + incrementRadiusFactorPerChild; //One child
    //Avoid the root node from being so large that overlaps/hides its children
    if ((d.parent === null || d.parent === undefined) && d.radius < 180) d.radius = 180;
    if ((d.parent === null || d.parent === undefined) && d.radius > edgeLength / 2) d.radius = edgeLength / 2.0;
    return Math.min(d.radius, 300);
}

/**
 * Computes the borders of a box containing our nodes
 * */
function computeDimensions(nodes) {

    /* Note our coordinate system:
    *
    *                     | Y negative
    *                     |
    * X negative <--------|-------> X positive
    *                     |
    *                     | Y positive
    * And note we need to take into account the radius of the node
    * */
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
        if ((n.x - n.radius) < minX) minX = n.x - n.radius;
        if ((n.y - n.radius) < minY) minY = n.y - n.radius;
        if ((n.x + n.radius) > maxX) maxX = n.x + n.radius;
        if ((n.y + n.radius) > maxY) maxY = n.y + n.radius;

    }
    return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
}

/**
 * Center graph and zoom to fit the whole graph visualization in our canvas
 * */
function zoomToFitGraph(minX, minY, maxX, maxY,
                        root,
                        canvasHeight = 1080, canvasWidth = 1920,
                        duration = 750) {
    /* Note our coordinate system:
     *
     *
     *                     | X negative
     *                     |
     * Y negative <--------|-------> Y positive
     *                     |
     *                     | X positive
     * Due to the D3 algorithm we are expecting: minX = - maxX
     * and due to the assignment of the root positions: minY = 0
     * */
    var boxWidth = maxY - minY,
        boxHeight = maxX - minX;

    var midY = boxWidth / 2.0,
        midX = boxHeight / 2.0;

    scale = Math.min(canvasWidth / boxWidth, canvasHeight / boxHeight);

    var newX = canvasWidth / 2.0,
        newY = canvasHeight / 2.0;

    if (canvasWidth / boxWidth < canvasHeight / boxHeight) {
        newY -= midX * scale;
        newX -= midY * scale;
    } else newX -= midY * scale;

    //For nodes wider than tall, we need to displace them to the middle of the graph
    if (newY < boxHeight * scale && boxHeight * scale < canvasHeight) newY = canvasHeight / 2.0;

    d3.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + (newX + root.radius * scale) + "," + newY + ")scale(" + scale + ")");

    return {
        initialZoom: scale,
        initialY: newX + root.radius * scale,
        initialX: newY
    }
}

/**
 * Highlights nodes by category of Toxicity
 * */
function highlightToxicityOR(node, enabledHighlight) {

    //Toxicity 0
    if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 0) d.highlighted = 1;
            //console.log(d);
            return (d.toxicity_level === 0);
        }).style("opacity", 1);
    }

    //Toxicity 1
    if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 1) d.highlighted = 1;
            //console.log(d);
            return (d.toxicity_level === 1);
        }).style("opacity", 1);
    }

    //Toxicity 2
    if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 2) d.highlighted = 1;
            //console.log(d);
            return (d.toxicity_level === 2);
        }).style("opacity", 1);
    }

    //Toxicity 3
    if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 3) d.highlighted = 1;
            //console.log(d);
            return (d.toxicity_level === 3);
        }).style("opacity", 1);
    }

}

/**
 * Highlights nodes and edges by category of Toxicity belonging to the intersection of selected values
 *
 * Unhighlights nodes that do not have the selected property
 * */
function highlightToxicityAND(node, enabledHighlight, opacityValue = 0.1) {
    //Toxicity not 0
    if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
        var unhighlightNodes = node.filter(function (d) {
            if (d.toxicity_level !== 0) d.highlighted = 0;
            return (d.toxicity_level !== 0);
        });
        unhighlightNodes.style("opacity", opacityValue);
        unhighlightNodes.select("g.node.backgroundCircle").style("opacity", 1);
        /*for(const n of unhighlightNodes){
            console.log("something", n.firstChild);
        }*/
        //unhighlightNodes.select("image.backgroundCircle").style("opacity", 1);

        //unhighlightNodes.selectAll("#backgroundCircle").style("opacity", 1);
        //.select("image:not(.backgroundCircle)")
        //.select(".nodeCircle, .featInsult, .nodeText")
        /* .style("position", "relative")
         .style("z-index", 1)*/

        /*.select('[class^="feat-"]')
        .style("opacity", opacityValue)
        .select('[class^="target-"]')
        .style("opacity", opacityValue)*/
    }

    //Toxicity not 1
    if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level !== 1) d.highlighted = 0;
            return (d.toxicity_level !== 1);
        })
            // .select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Toxicity not 2
    if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level !== 2) d.highlighted = 0;
            return (d.toxicity_level !== 2);
        })
            // .select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Toxicity not 3
    if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level !== 3) d.highlighted = 0;
            return (d.toxicity_level !== 3);
        })
            // .select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

}

function highlightStanceOR(node, enabledHighlight) {

    //Neutral stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
        node.filter(function (d) {
            if (!d.positive_stance && !d.negative_stance) d.highlighted = 1;
            return (!d.positive_stance && !d.negative_stance);
        }).style("opacity", 1);
    }

    //Positive stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
        node.filter(function (d) {
            if (d.positive_stance) d.highlighted = 1;
            return (d.positive_stance);
        }).style("opacity", 1);
    }

    //Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
        node.filter(function (d) {
            if (d.negative_stance) d.highlighted = 1;
            return (d.negative_stance);
        }).style("opacity", 1);
    }

}

function highlightStanceAND(node, enabledHighlight, opacityValue = 0.1) {

    //Neutral stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
        node.filter(function (d) {
            if (d.positive_stance || d.negative_stance) d.highlighted = 0;
            return (d.positive_stance || d.negative_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Positive stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
        node.filter(function (d) {
            if (!d.positive_stance) d.highlighted = 0;
            return (!d.positive_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
        node.filter(function (d) {
            if (!d.negative_stance) d.highlighted = 0;
            return (!d.negative_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

}

function highlightTargetOR(node, enabledHighlight) {

    //Target group CB is checked
    if (enabledHighlight.indexOf("highlight-target-group") > -1) {
        node.filter(function (d) {
            if (d.target_group) d.highlighted = 1;
            return (d.target_group);
        }).style("opacity", 1);
    }

    //Target person CB is checked
    if (enabledHighlight.indexOf("highlight-target-person") > -1) {
        node.filter(function (d) {
            if (d.target_person) d.highlighted = 1;
            return (d.target_person);
        }).style("opacity", 1);
    }

    //Stereotype CB is checked
    if (enabledHighlight.indexOf("highlight-target-stereotype") > -1) {
        node.filter(function (d) {
            if (d.stereotype) d.highlighted = 1;
            return (d.stereotype);
        }).style("opacity", 1);
    }
}

function highlightTargetAND(node, enabledHighlight, opacityValue = 0.1) {

    //Target group CB is checked
    if (enabledHighlight.indexOf("highlight-target-group") > -1) {
        node.filter(function (d) {
            if (!d.target_group) d.highlighted = 0;
            return (!d.target_group);
        }).style("opacity", opacityValue);

    }

    //Target person CB is checked
    if (enabledHighlight.indexOf("highlight-target-person") > -1) {
        node.filter(function (d) {
            if (!d.target_person) d.highlighted = 0;
            return (!d.target_person);
        }).style("opacity", opacityValue);
    }

    //Stereotype CB is checked
    if (enabledHighlight.indexOf("highlight-target-stereotype") > -1) {
        node.filter(function (d) {
            if (!d.stereotype) d.highlighted = 0;
            return (!d.stereotype);
        }).style("opacity", opacityValue);
    }
}

function highlightPositiveOR(node, enabledHighlight) {

    //Argumentation CB is checked
    if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
        node.filter(function (d) {
            if (d.argumentation) d.highlighted = 1;
            return (d.argumentation);
        }).style("opacity", 1);
    }

    //Constructiveness CB is checked
    if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
        node.filter(function (d) {
            if (d.constructiveness) d.highlighted = 1;
            return (d.constructiveness);
        }).style("opacity", 1);
    }

}

function highlightPositiveAND(node, enabledHighlight, opacityValue = 0.1) {
    //Argumentation CB is checked
    if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
        node.filter(function (d) {
            if (!d.argumentation) d.highlighted = 0;

            return (!d.argumentation);
        }).style("opacity", opacityValue);
    }

    //Constructiveness CB is checked
    if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
        node.filter(function (d) {
            if (!d.constructiveness) d.highlighted = 0;

            return (!d.constructiveness);
        }).style("opacity", opacityValue);
    }

}

function highlightNegativeOR(node, enabledHighlight) {

    //Sarcasm CB is checked
    if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
        node.filter(function (d) {
            if (d.sarcasm) d.highlighted = 1;
            return (d.sarcasm);
        }).style("opacity", 1);
    }

    //Mockery CB is checked
    if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
        node.filter(function (d) {
            if (d.mockery) d.highlighted = 1;
            return (d.mockery);
        }).style("opacity", 1);
    }

    //Intolerance CB is checked
    if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
        node.filter(function (d) {
            if (d.intolerance) d.highlighted = 1;
            return (d.intolerance);
        }).style("opacity", 1);
    }

    //Improper language CB is checked
    if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
        node.filter(function (d) {
            if (d.improper_language) d.highlighted = 1;
            return (d.improper_language);
        }).style("opacity", 1);
    }

    //Insult language CB is checked
    if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
        node.filter(function (d) {
            if (d.insult) d.highlighted = 1;
            return (d.insult);
        }).style("opacity", 1);
    }

    //Aggressiveness language CB is checked
    if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
        node.filter(function (d) {
            if (d.aggressiveness) d.highlighted = 1;
            return (d.aggressiveness);
        }).style("opacity", 1);
    }
}

function highlightNegativeAND(node, enabledHighlight, opacityValue = 0.1) {

    //Sarcasm CB is checked
    if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
        node.filter(function (d) {
            if (!d.sarcasm) d.highlighted = 0;
            return (!d.sarcasm);
        }).style("opacity", opacityValue);
    }

    //Mockery CB is checked
    if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
        node.filter(function (d) {
            if (!d.mockery) d.highlighted = 0;
            return (!d.mockery);
        }).style("opacity", opacityValue);
    }

    //Intolerance CB is checked
    if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
        node.filter(function (d) {
            if (!d.intolerance) d.highlighted = 0;
            return (!d.intolerance);
        }).style("opacity", opacityValue);
    }

    //Improper language CB is checked
    if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
        node.filter(function (d) {
            if (!d.improper_language) d.highlighted = 0;
            return (!d.improper_language);
        }).style("opacity", opacityValue);
    }

    //Insult language CB is checked
    if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
        node.filter(function (d) {
            if (!d.insult) d.highlighted = 0;
            return (!d.insult);
        }).style("opacity", opacityValue);
    }

    //Aggressiveness language CB is checked
    if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
        node.filter(function (d) {
            if (!d.aggressiveness) d.highlighted = 0;
            return (!d.aggressiveness);

        }).style("opacity", opacityValue);
    }
}


// Get JSON data
treeJSON = d3.json(dataset, function (error, json) {
    if (error) throw error;

    /*
    Definitions
    * */

    /* Size of the canvas, root element and nodes
    * */
    var width = $(document).width(),
        height = $(document).height(),
        root, rootName = "News Article", nodes;


    var initialZoom, initialX, initialY; //Initial zoom and central coordinates of the first visualization of the graph

    /* Icon for the root node */
    var rootPath = pr;
    var objRoot = {
        class: "rootNode",
        id: "rootNode",
        fileName: "root.png"
    };

    // Used to obtain the nodes belonging to the deepest thread
    var deepestNodesPath;

    var imgRatio = 20; //Percentage of difference between the radii of a node and its associated image

    var optimalK; //Computed optimal distance between nodes

    var ringHeight = 55, ringWidth = 55, ringX = -10, ringY = -10;
    var radiusFactor = 2; // The factor by which we multiply the radius of a node when collapsed with more than 2 children
    var opacityValue = 0.1; //Opacity when a node or link is not highlighted

    var currentX = initialX;
    var currentY = initialY;
    var currentScale = initialZoom;


    /**
     * Define zoom and translation
     * */
    function zoom() {

        /* The initial d3 events for scale and translation have initial values 1 and [x,y] = [50, 200] respectively
         * Therefore we need to take this into account and sum the difference to our initial scale and position attributes
         * defined in zoomToFit()
         * */

        /*
        * NOTE:
        * If the scale is negative, we will see the graph upside-down and left-right swapped
        * If the scale is 0, we will not see the graph
        * Define the scale to be at least 0.1 and set it to the initialZoom + the difference of the listener and the d3.event initial scale
        * */
        let newScale = Math.max(initialZoom + (d3.event.scale - 1), 0.1); //Avoid the graph to be seen mirrored.
        //console.log("New scale is: ", initialZoomScale + (d3.event.scale - 1))
        /*
        * NOTE: Add to the initial position values (initialX and initialY) the movement registered by d3.
        * d3.event.translate returns an array [x,y] with starting values [50, 200]
        * The values X and Y are swapped in zoomToFit() and we need to take that into account to give the new coordinates
        * */
        let movement = d3.event.translate;
        let newX = initialX + (movement[1]);
        let newY = initialY + (movement[0]);
        svg.attr("transform", "translate(" + [newY, newX] + ")scale(" + newScale + ")");
        currentScale = newScale;

    }

    let zoomListener = d3.behavior.zoom().scaleExtent([minZoom, maxZoom]).on("zoom", function () {
        currentZoomScale = d3.event.scale
        link.style("stroke-width", getEdgeStrokeWidth()); //Enlarge stroke-width on zoom out
        node.select("circle").style("stroke-width", getNodeStrokeWidth()); //Enlarge stroke-width on zoom out
        zoom();
    });

    var tooltipText;

    /*
    Targets: size, position, local path, objects to draw the target as ring
    * */
    var drawingAllInOne = false; //if we are drawing all together or separated
    var pathTargets = pt;
    var targetIconHeight = 30, targetIconWidth = 30, targetIconGroupX = -30, targetIconPersonX = -50,
        targetIconStereotypeX = -70, targetIconY = -10; //Size and relative position of targets drawn as icons
    var objTargetGroupRing = {
            class: "targetGroup",
            id: "targetGroup",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Group.svg"
        },
        objTargetPersonRing = {
            class: "targetPerson",
            id: "targetPerson",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Person.svg"
        },
        objTargetStereotypeRing = {
            class: "targetStereotype",
            id: "targetStereotype",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Stereotype.svg"
        },
        objTargetGrayRing = {
            class: "targetGray",
            id: "targetGray",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Gray.svg"
        };

    /* Features: size, position, local path
    * */
    var cheeseX = -17.53, cheeseY = -27.45, cheeseHeight = 55, cheeseWidth = 55;
    var pathFeatures = pf;

    /* Toxicity: objects to draw the toxicity as image
    * */
    var objToxicity0 = {class: "toxicity0", id: "toxicity0", selected: 1, fileName: "Level0.svg"},
        objToxicity1 = {class: "toxicity1", id: "toxicity1", selected: 1, fileName: "Level1.svg"},
        objToxicity2 = {class: "toxicity2", id: "toxicity2", selected: 1, fileName: "Level2.svg"},
        objToxicity3 = {class: "toxicity3", id: "toxicity3", selected: 1, fileName: "Level3.svg"};


    /* Construct a new force-directed layout
    * in the dimensions given
    * on tick, computes one step of the simulation force layout
    * disabling gravity makes the layout better, since we do not have invisible strings attracting nodes to the center of the screen
    * repulsive charge to make nodes repel each other. The lower the value (i.e. the more repulsive force), the longer the edges
    * approximated link distance, real distance depends on other factors
   * */
    let force = d3.layout.force()
        .size([canvasWidth * canvasFactor, canvasHeight * canvasFactor])
        .on("tick", tick)
        //.friction(0.95)
        .linkDistance(function (d) {
            let length = 500 - d.source.depth * 10;
            return length > 80 ? length : 80;
        })
        .charge(-600)
        .gravity(0) //Disable gravity
    ;


    // Hover rectangle in which the information of a node is displayed
    var tooltip = d3.select(container)
        .append("div")
        .attr("class", "my-tooltip") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "60")
        .style("visibility", "hidden");

    // Div where the sum up information of "Static Values" is displayed
    var statisticBackground = d3.select(container)
        .append("div")
        .attr("class", "my-statistic") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "1") //it has no change
        .style("visibility", "visible")
        .style("right", "320px");


    var svg = d3.select(container) //Define the container that holds the layout
        .append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .attr("class", "overlay")
        //.call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom)) //Allow zoom
        .call(zoomListener) //Allow zoom
        .append("g");



    var link = svg.selectAll("path.link"),
        node = svg.selectAll(".node");


    /* SECTION Zoom*/
    var zoomLabel = document.getElementById("zoom_level");
    var XLabel = document.getElementById("position_x");
    var YLabel = document.getElementById("position_y");

    /*SECTION checkboxes*/
    //Check the values of the checkboxes and do something
    //Draw targets
    var checkboxesTargets = [document.getElementById("target-group"), document.getElementById("target-person"), document.getElementById("target-stereotype")];
    //console.log(checkboxesTargets);
    let enabledTargets = []; //Variable which contains the string of the enabled options to display targets

    // var checkboxStaticValues = document.querySelector("input[name=cbStaticValues]");


    // Select all checkboxes with the name 'cbFeatures' using querySelectorAll.
    var checkboxes = document.querySelectorAll("input[type=checkbox][name=cbFeatures]");
    let enabledFeatures = []; //Variable which contains the string of the enabled options to display features
    // var checkboxFeatureMenu = document.querySelector("input[name=cbFeatureMenu]");

    // Select how to display the features: svg circles or trivial cheese
    var checkboxesPropertyFeature = document.querySelectorAll("input[type=checkbox][name=cbFeatureProperty]");
    var checkboxFeatureDot = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=dot-feat]");
    var checkboxFeatureCheese = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=cheese-feat]");

    //Dropdown menu
    var checkboxesPositioningFeature = document.querySelectorAll("input[type=checkbox][name=cbFeaturePositioning]");
    // var cbFeatureInside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=on-node]");
    // var cbFeatureOutside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=node-outside]");

    // Select which properties and if an intersection or union of those
    var checkboxHighlightMenu = document.querySelector("input[name=cbHighlightMenu]");
    var checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
    var checkboxAND = document.querySelector("input[type=radio][name=cbHighlightProperty][value=and-group]");
    var checkboxOR = document.querySelector("input[type=radio][name=cbHighlightProperty][value=or-group]");
    var checkboxesHighlightGroupOR = document.querySelectorAll("input[name=cbHighlightOR]");
    var checkboxesHighlightGroupAND = document.querySelectorAll("input[name=cbHighlightAND]");

    let enabledHighlight = []; //Variable which contains the string of the enabled options to highlight
    /*END SECTION checkboxes*/

    var checkButtons = document.querySelectorAll("input[name=check_button_features]");

    /*
   Dropdown menus
   * */
    // var dropdownTargets = document.getElementById("dropdown-targets");
    // var dropdownFeatures = document.getElementById("dropdown-features");

    var dotsFeatures = document.getElementById("dots_icon_button");
    var glyphsFeatures = document.getElementById("glyphs_icon_button");

    //Define objects after the checkbox where we keep if it is selected
    var positionXtargets = -10;
    var objTargetGroup = {
            class: "targetGroup",
            id: "targetGroup",
            selected: enabledTargets.indexOf("target-group"),
            x: -70,
            y: 10,
            xDot: Math.cos(5 * Math.PI / 4),
            yDot: Math.sin(5 * Math.PI / 4),

            fix: -1,
            xOffset: -1,
            yOffset: -1,
            xInsideOffset: -0.9,
            yInsideOffset: -0.8,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Group.svg"
        },
        objTargetPerson = {
            class: "targetPerson",
            id: "targetPerson",
            selected: enabledTargets.indexOf("target-person"),
            x: -90,
            y: 10,
            xDot: Math.cos(7 * Math.PI / 4),
            yDot: Math.sin(7 * Math.PI / 4),

            fix: 0,
            xOffset: +1,
            yOffset: 0,
            xInsideOffset: -0.5,
            yInsideOffset: 0,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Person.svg"
        },
        objTargetStereotype = {
            class: "targetStereotype",
            id: "targetStereotype",
            selected: enabledTargets.indexOf("target-stereotype"),
            x: -110,
            y: 10,
            xDot: Math.cos(Math.PI / 2),
            yDot: Math.sin(Math.PI / 2),

            fix: 0,
            xOffset: -1,
            yOffset: +1,
            xInsideOffset: 0,
            yInsideOffset: -0.8,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Stereotype.svg"
        };


    var objFeatArgumentation = {
            class: "featArgumentation",
            id: "featArgumentation",
            color: colourArgumentation,
            selected: enabledFeatures.indexOf("argumentation"),
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos(Math.PI / 2),
            yDot: Math.sin(Math.PI / 2),

            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Argumentation.svg"
        },
        objFeatConstructiveness = {
            class: "featConstructiveness",
            id: "featConstructiveness",
            color: colourConstructiveness,
            selected: enabledFeatures.indexOf("constructiveness"),
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos(Math.PI / 4),
            yDot: Math.sin(Math.PI / 4),

            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Constructiveness.svg"
        },
        objFeatSarcasm = {
            class: "featSarcasm",
            id: "featSarcasm",
            color: colourSarcasm,
            selected: enabledFeatures.indexOf("sarcasm"),
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos(0),
            yDot: Math.sin(0),
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Sarcasm.svg"
        },
        objFeatMockery = {
            class: "featMockery",
            id: "featMockery",
            color: colourMockery,
            selected: enabledFeatures.indexOf("mockery"),
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos((7 * Math.PI) / 4),
            yDot: Math.sin((7 * Math.PI) / 4),

            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Mockery.svg"
        },
        objFeatIntolerance = {
            class: "featIntolerance",
            id: "featIntolerance",
            color: colourIntolerance,
            selected: enabledFeatures.indexOf("intolerance"),
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos((3 * Math.PI) / 2),
            yDot: Math.sin((3 * Math.PI) / 2),

            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Intolerance.svg"
        },
        objFeatImproper = {
            class: "featImproper",
            id: "featImproper",
            color: colourImproper,
            selected: enabledFeatures.indexOf("improper_language"),
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos((5 * Math.PI) / 4),
            yDot: Math.sin((5 * Math.PI) / 4),

            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Improper.svg"
        },
        objFeatInsult = {
            class: "featInsult",
            id: "featInsult",
            color: colourInsult,
            selected: enabledFeatures.indexOf("insult"),
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos(Math.PI),
            yDot: Math.sin(Math.PI),

            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Insult.svg"
        },
        objFeatAggressiveness = {
            class: "featAggressiveness",
            selected: enabledFeatures.indexOf("aggressiveness"),
            color: colourAggressiveness,
            id: "featAggressiveness",
            x: cheeseX,
            y: cheeseY,
            xDot: Math.cos((3 * Math.PI) / 4),
            yDot: Math.sin((3 * Math.PI) / 4),

            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Aggressiveness.svg"
        },
        objFeatGray = {
            class: "featGray",
            id: "featGray",
            selected: 1,
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Gray.svg"
        };


    /*SECTION draw svgs from checboxes*/

    function drawTargetGroup(nodeEnter) {
        nodeEnter.append("image")
            .attr('class', 'targetGroup')
            .attr('id', 'targetGroup')
            .attr("x", function (d) {
                if (d.parent) return (d.x - d.parent.x) / euclideanDistance(d, d.parent);
                return 0;
            }) //NOTE: it is always displayed at the left side!!
            .attr("y", function (d) {
                if (d.parent) return (d.y - d.parent.y) / euclideanDistance(d, d.parent);
                return 0;
            })
            .attr("height", 15)
            .attr("width", 15)
            .attr("href", "./images/targets/icons/Group.svg")
            .attr("opacity", function (d) {
                if (d.target_group) return 1
                return 0 //We need to set the opacity or it will always be displayed!
            });
    }

    function drawTargetGroupRing(nodeEnter) {
        nodeEnter.append("image")
            .attr('class', 'targetGroup')
            .attr('id', 'targetGroup')
            .attr("x", ringX)
            .attr("y", ringY)
            .attr("height", ringHeight)
            .attr("width", ringWidth)
            .style("z-index", -1)
            .attr("href", "./images/targets/rings/Group.svg")
            .attr("opacity", function (d) {
                if (d.target_group) return 1
                return 0 //We need to set the opacity or it will always be displayed!
            });
    }

    function drawTargetPerson(nodeEnter) {
        //console.log("person icon");
        nodeEnter.append("image")
            .attr('class', 'targetPerson')
            .attr('id', 'targetPerson')
            //.attr("x", -2) //NOTE: it is always displayed at the left side!!
            //.attr("y", -2)
            .attr("x", function (d) {
                if (d.parent) return 4 + (d.x - d.parent.x) / euclideanDistance(d, d.parent);
                return 0;
            }) //NOTE: it is always displayed at the left side!!
            .attr("y", function (d) {
                //if(d.parent) return 0 + d.y -  d.parent.y;
                if (d.parent) return 4 + (d.y - d.parent.y) / euclideanDistance(d, d.parent);
                return 0;
            })
            .attr("height", 15)
            .attr("width", 15)
            .attr("href", "./images/targets/icons/Person.svg")
            .attr("opacity", function (d) {
                if (d.target_person) return 1
                return 0
            });
    }

    function drawTargetPersonRing(nodeEnter) {
        nodeEnter.append("image")
            .attr('class', 'targetPerson')
            .attr('id', 'targetPerson')
            .attr("x", ringX)
            .attr("y", ringY)
            .attr("height", ringHeight)
            .attr("width", ringWidth)
            .style("z-index", -1)
            .attr("href", "./images/targets/rings/Person.svg")
            .attr("opacity", function (d) {
                if (d.target_person) return 1
                return 0
            });
    }

    function drawTargetStereotypeRing(nodeEnter) {
        nodeEnter.append("image")
            .attr('class', 'targetStereotype')
            .attr('id', 'targetStereotype')
            .attr("x", ringX)
            .attr("y", ringY)
            .attr("height", ringHeight)
            .attr("width", ringWidth)
            .style("z-index", -1)
            .attr("href", "./images/targets/rings/Stereotype.svg")
            .attr("opacity", function (d) {
                if (d.stereotype) return 1
                return 0
            });
    }

    function drawTargeStereotype(nodeEnter) {
        nodeEnter.append("image")
            .attr('class', 'targetStereotype')
            .attr('id', 'targetStereotype')
            /*.attr("x", 2) //NOTE: it is always displayed at the left side!!
            .attr("y", 2)*/
            .attr("x", function (d) {
                if (d.parent) return 2 + (d.x - d.parent.x) / euclideanDistance(d, d.parent);
                return 0;
            }) //NOTE: it is always displayed at the left side!!
            .attr("y", function (d) {
                //if(d.parent) return 0 + d.y -  d.parent.y;
                if (d.parent) return 2 + (d.y - d.parent.y) / euclideanDistance(d, d.parent);
                return 0;
            })
            .attr("height", 15)
            .attr("width", 15)
            .attr("href", "./images/targets/icons/Stereotype.svg")
            .attr("opacity", function (d) {
                if (d.stereotype) return 1
                return 0
            });
    }

    function removeTargets() {
        d3.selectAll("#targetGroup").remove();
        d3.selectAll("#targetPerson").remove();
        d3.selectAll("#targetStereotype").remove();
    }

    /**
     * Draw the targets of a node
     * If just one checkbox is checked, draw the icon
     * If there is more than one checkbox checked, draw the targets as rings
     * */
    function visualiseTargets(node) {
        removeTargets();

        if (enabledTargets.length === 1) { // Draw icons
            enabledTargets.indexOf("target-group") > -1 ? drawTargetGroup(node) : d3.selectAll("#targetGroup").remove();
            enabledTargets.indexOf("target-person") > -1 ? drawTargetPerson(node) : d3.selectAll("#targetPerson").remove();
            enabledTargets.indexOf("target-stereotype") > -1 ? drawTargeStereotype(node) : d3.selectAll("#targetStereotype").remove();
        } else if (enabledTargets.length > 1) { //Draw rings
            removeTargets();
            enabledTargets.indexOf("target-group") > -1 ? drawTargetGroupRing(node) : d3.selectAll("#targetGroup").remove();
            enabledTargets.indexOf("target-person") > -1 ? drawTargetPersonRing(node) : d3.selectAll("#targetPerson").remove();
            enabledTargets.indexOf("target-stereotype") > -1 ? drawTargetStereotypeRing(node) : d3.selectAll("#targetStereotype").remove();
        }
    }

    /*END section*/

    /* SECTION TO DRAW TARGETS */

    /**
     * Compute the position of an associated image to be centered on the node
     * that is a radiusPercentage smaller than it
     * */
    function positionImage(nodeRadius, radiusPercentage = imgRatio) {
        return Math.min(nodeRadius * (radiusPercentage / 100.0 - 1), 300);
    }

    /**
     * Compute the size of an associated image to be a radiusPercentage smaller than the node
     * */
    function sizeImage(nodeRadius, radiusPercentage = imgRatio) {

        return Math.min(2 * nodeRadius * (1 - radiusPercentage / 100.0));
    }

    /**
     * Remove all the target icon or images of the given node
     * */
    function removeThisTargets(nodeEnter) {
        nodeEnter.select("#targetGroup").remove();
        nodeEnter.select("#targetPerson").remove();
        nodeEnter.select("#targetStereotype").remove();
        nodeEnter.select("#targetGray").remove();
    }

    /**
     * Draws the 3 targets of a node if the checkbox is checked
     * and if the node has that target (sets the opacity to visible)
     *
     * The icon used is from the local path passed by parameter
     * The css values are from the target objects that are icons
     * */
    function drawTargets(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];
        var listOpacity;
        var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === null || d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("x", targets[i].x)
                    .attr("y", targets[i].y)
                    .attr("height", targets[i].height)
                    .attr("width", targets[i].width)
                    .attr("href", pathTargets + localPath + targets[i].fileName)
            }
        }
    }

    /**
     * Draws the 3 targets of a node if the checkbox is checked
     * and if the node has that target (sets the opacity to visible)
     *
     * The icon used is from the local path passed by parameter
     * The css values are from the target objects that are rings
     * */
    function drawTargetRings(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [1, enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")]; //Note: we will always display the gray ring
        var listOpacity;
        var targets = [objTargetGrayRing, objTargetGroupRing, objTargetPersonRing, objTargetStereotypeRing];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;
                        listOpacity = [0.5, d.target_group, d.target_person, d.stereotype]; //Note: the opacity of the gray ring
                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Determines the type of visualization for the targets
     * determinated by the drop down menu
     *
     *
     * */
    function selectTargetVisualization(nodeEnter) {
        // var option = dropdownTargets.value;
        var option = "icons";

        //If we are displaying all in one, call that function
        if (false) selectFeatureVisualization(nodeEnter);
        else {
            switch (option) {
                //draw as icons on the left side of the node
                case "icons":
                    drawTargets(nodeEnter, "icons/");
                    break;
                case "icon-outside-node":
                    drawTargetsOutside(nodeEnter, "icons/");
                    break;

                case "icon-on-node":
                    drawTargetsInside(nodeEnter, "icons/");
                    break;
                case "directory-1":
                    drawTargets(nodeEnter, "newOption1/")
                    break;
                case "directory-2":
                    drawTargets(nodeEnter, "NewCircular/")
                    break;
                //draw as ring outside of the node
                case "ring-on-node":
                    drawTargetRings(nodeEnter, "rings/")
                    break;
                //draw as an icon if 1, as rings if more options checked
                case "one-icon-or-rings":
                    enabledTargets.length > 1 ? drawTargetRings(nodeEnter, "rings/") : drawTargets(nodeEnter, "icons/");
                    break;

                default:
                    //console.log("default option", option);
                    break;
            }
        }
    }

    /**
     * Draws the 3 targets of a node if the checkbox is checked
     * and if the node has that target (sets the opacity to visible)
     *
     * The icon used is from the local path passed by parameter
     * The css values are from the target objects that are icons
     * */
    function drawTargetsOutside(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];
        var listOpacity;
        var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("transform", function (d) {
                        //Translate the images to be at the border of the node in a triangle
                        return "translate(" + (d.radius * targets[i].xDot + targets[i].width * targets[i].fix) +
                            "," + (d.radius * targets[i].yDot) + ")";

                    })
                    .attr("height", targets[i].height)
                    .attr("width", targets[i].width)
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;
                        listOpacity = [d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Draws the 3 targets of a node if the checkbox is checked
     * and if the node has that target (sets the opacity to visible)
     *
     * The icon used is from the local path passed by parameter
     * The css values are from the target objects that are icons
     * */
    function drawTargetsInside(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];
        var listOpacity;
        var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.append("image")
                    .attr('class', targets[i].class)
                    .attr('id', targets[i].id)
                    .attr("x", function (d) {
                        return d.radius * targets[i].xInsideOffset;
                    })
                    .attr("y", function (d) {
                        return d.radius * targets[i].yInsideOffset;
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius) / 2.0;
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius) / 2.0;

                    })
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;
                        listOpacity = [d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    });
            }
        }
    }

    /* SECTION: Draw features*/

    /** Removes the pngs for the toxicities drawn
     * */
    function removeToxicities(nodeEnter) {
        nodeEnter.selectAll("#toxicity0").remove();
        nodeEnter.selectAll("#toxicity1").remove();
        nodeEnter.selectAll("#toxicity2").remove();
        nodeEnter.selectAll("#toxicity3").remove();
    }

    /**
     * Removes the features of the node given
     * */
    function removeThisFeatures(nodeEnter) {
        nodeEnter.selectAll("#featGray").remove();
        nodeEnter.selectAll("#featArgumentation").remove();
        nodeEnter.selectAll("#featConstructiveness").remove();
        nodeEnter.selectAll("#featSarcasm").remove();
        nodeEnter.selectAll("#featMockery").remove();
        nodeEnter.selectAll("#featIntolerance").remove();
        nodeEnter.selectAll("#featImproper").remove();
        nodeEnter.selectAll("#featInsult").remove();
        nodeEnter.selectAll("#featAggressiveness").remove();
    }

    /**
     * Removes the features of all the nodes
     * */
    function removeAllFeatures() {
        d3.selectAll("#featGray").remove();
        d3.selectAll("#featArgumentation").remove();
        d3.selectAll("#featConstructiveness").remove();
        d3.selectAll("#featSarcasm").remove();
        d3.selectAll("#featMockery").remove();
        d3.selectAll("#featIntolerance").remove();
        d3.selectAll("#featImproper").remove();
        d3.selectAll("#featInsult").remove();
        d3.selectAll("#featAggressiveness").remove();
    }

    /**
     * Removes the toxicities of all the nodes
     * */
    function removeAllToxicities() {
        d3.selectAll("#toxicity0").remove();
        d3.selectAll("#toxicity1").remove();
        d3.selectAll("#toxicity2").remove();
        d3.selectAll("#toxicity3").remove();
    }

    /**
     * Hide all images associated with the drawing of features
     * */
    function hideFeatureImages() {

        removeAllFeatures();
        removeAllToxicities();
    }

    /**
     * Delete the features of the node
     * Redraw the features of the node
     *
     * Deleting the features firts helps us when the selected dropdown menu option changes
     * */
    function drawFeatureDots(nodeEnter) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        var cbFeatureEnabled = [enabledFeatures.indexOf("constructiveness"), enabledFeatures.indexOf("argumentation"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

        var features = [objFeatConstructiveness, objFeatArgumentation, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
        var listOpacity;

        for (var i = 0; i < 8; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === null || d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [d.constructiveness, d.argumentation, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listOpacity[i];
                    }
                }).append("circle")
                    .attr('class', features[i].class)
                    .attr('id', features[i].id)
                    .attr("r", dotRadius)
                    .attr("transform", function (d) {
                        return "translate(" + ((d.radius + dotRadius) * features[i].xDot) + "," + ((d.radius + dotRadius) * features[i].yDot) + ")";


                    })
                    .attr("fill", features[i].color)
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px");
            }
        }

    }

    function drawFeatureAsCheese(nodeEnter, localPath) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        //Add the gray cheese
        nodeEnter.append("image")
            .attr('class', objFeatGray.class)
            .attr('id', objFeatGray.id)
            .attr("x", function (d) {
                return positionImage(d.radius);
            })
            .attr("y", function (d) {
                return positionImage(d.radius);
            })
            .attr("height", function (d) {
                return sizeImage(d.radius);
            })
            .attr("width", function (d) {
                return sizeImage(d.radius);
            })
            .attr("href", pathFeatures + localPath + objFeatGray.fileName)
            .attr("opacity", function (d) {
                if (d.parent === null || d.parent === undefined) return 0;
                return 0.5;
            });

        var cbFeatureEnabled = [enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

        var features = [objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
        var listOpacity;

        for (var i = 0; i < features.length; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === null || d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr('class', features[i].class)
                    .attr('id', features[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius);
                    })
                    .attr("href", pathFeatures + localPath + features[i].fileName)
            }
        }
    }

    /**
     * Hide all previous features and targets
     * Draw everything inside of the node
     * */
    function drawFeatureAsGlyph(nodeEnter, localPath, localPosition) {
        removeThisFeatures(nodeEnter);
        removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            objTargetGroup, objTargetPerson, objTargetStereotype];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1, 1, 1, 1,
            enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness"),
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;

                        listOpacity = [d.toxicity_level === 0 ? 1 : 0, d.toxicity_level === 1 ? 1 : 0, d.toxicity_level === 2 ? 1 : 0, d.toxicity_level === 3 ? 1 : 0,
                            d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness,
                            d.target_group, d.target_person, d.stereotype];

                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Hide all previous features and targets
     * Draw everything inside of the node
     * */
    function drawFeatureAsRectangularGlyph(nodeEnter, localPath, localPosition) {
        removeThisFeatures(nodeEnter);
        removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            objTargetGroup, objTargetPerson, objTargetStereotype];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1, 1, 1, 1,
            enabledSettings.indexOf("argumentation"), enabledSettings.indexOf("constructiveness"),
            enabledSettings.indexOf("sarcasm"), enabledSettings.indexOf("mockery"), enabledSettings.indexOf("intolerance"),
            enabledSettings.indexOf("improper_language"), enabledSettings.indexOf("insult"), enabledSettings.indexOf("aggressiveness"),
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius + d.radius / 5.0, 0);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius + d.radius / 5.0, 0);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius + d.radius / 5.0, 0);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius + d.radius / 5.0, 0);
                    })
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === null || d.parent === undefined) return 0;

                        listOpacity = [d.toxicity_level === 0 ? 1 : 0, d.toxicity_level === 1 ? 1 : 0, d.toxicity_level === 2 ? 1 : 0, d.toxicity_level === 3 ? 1 : 0,
                            d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness,
                            d.target_group, d.target_person, d.stereotype];

                        return listOpacity[i];
                    });
            }
        }
    }

    /**
     * Draw everything in a circular glyph
     * Better done than perfect
     *
     * Due to pngs order, features need to be drawn first
     * */
    function drawFeatureAsCircularGlyph(nodeEnter, localPath, localPosition) {
        removeThisFeatures(nodeEnter);
        //removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [objFeatGray,
            objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
            objToxicity0, objToxicity1, objToxicity2, objToxicity3,
            //objTargetGroup, objTargetPerson, objTargetStereotype
        ];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [1,
            enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness"),
            1, 1, 1, 1,
            enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];


        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
                nodeEnter.filter(function (d) {
                        if (d.parent === null || d.parent === undefined) {
                            return false;
                        } else {
                            listOpacity = [1,
                            d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness,
                            d.toxicity_level === 0 ? 1 : 0, d.toxicity_level === 1 ? 1 : 0, d.toxicity_level === 2 ? 1 : 0, d.toxicity_level === 3 ? 1 : 0,
                            d.target_group, d.target_person, d.stereotype];

                            return listOpacity[i];
                        }
                    }).append("image")
                    .attr('class', allObjectsInNode[i].class)
                    .attr('id', allObjectsInNode[i].id)
                    .attr("x", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("y", function (d) {
                        return positionImage(d.radius, 0);
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius, 0);
                    })
                    .style("stroke", "black")
                    .style("stroke-width", "0.5px")
                    .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName);
            }
        }
    }


    /**
     * Determines the type of visualization for the features
     * determinated by the drop down menu
     *
     *
     * */
    function selectFeatureVisualization(nodeEnter) {
        // var option = dropdownFeatures.value;

        var option = "dots";

        if (dotsFeatures.checked) {
            option = "dots";
        }

        if (glyphsFeatures.checked) {
            option = "directory-2";
        }

        // document.getElementById("feature-over-node-or-outside").style.display = "none"; //Hide the dropdown menu
        drawingAllInOne = false;
        var localPosition = -10;
        // cbFeatureInside.checked ? localPosition = -10 : localPosition = 10;

        switch (option) {
            case "dots":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureDots(nodeEnter); //Always drawn on the right side
                break;
            case "trivial-cheese-on-node":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureAsCheese(nodeEnter, "trivialCheese/"); //Always drawn on the right side
                break;

            case "directory-1": //"All for one and one for all" we will draw the features inside of the circle, the targets outside will be hidden and the level of toxicity in blue
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu

                drawFeatureAsGlyph(nodeEnter, "Bubble/", localPosition);
                break;
            case "directory-2":
                drawingAllInOne = false;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
                selectTargetVisualization(nodeEnter);
                drawFeatureAsCircularGlyph(nodeEnter, "NewCircular/", localPosition);
                break;

            case "directory-3":
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
                drawFeatureAsRectangularGlyph(nodeEnter, "Rectangular/", localPosition);
                break;

            case "new-circular":
                drawingAllInOne = true;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById(
                //     "feature-over-node-or-outside"
                // ).style.display = "block"; //Show the dropdown menu
                drawFeatureAsCircularGlyph(
                    nodeEnter,
                    "NewCircular/",
                    localPosition
                );
                break;

            default:
                //console.log("default option", option);
                break;
        }
    }

    /**
     * Draw an icon for the root node
     * */
    function visualiseRootIcon(node) {

        //Filter the nodes and append an icon just for the root node
        node.filter(function (d) {
            return (d.parent === null || d.parent === undefined);
        }).append("image")
            .attr('class', objRoot.class)
            .attr('id', objRoot.id)
            .attr("x", positionImage(Math.min(root.radius, 300), 0))
            .attr("y", positionImage(Math.min(root.radius, 300), 0))
            .attr("height", sizeImage(Math.min(root.radius, 300), 0))
            .attr("width", sizeImage(Math.min(root.radius, 300), 0))

            .attr("href", rootPath + objRoot.fileName)
            .attr("opacity", 1);
    }

    /*SECTION highlighting */
    function highlightByPropertyOR(node, link) {
        node.style("opacity", 0.2);
        link.style("opacity", 0.2);

        //Toxicity 0
        if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 0);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 0);
            }).style("opacity", 1);
        }

        //Toxicity 1
        if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 1);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 1);
            }).style("opacity", 1);
        }

        //Toxicity 2
        if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 2);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 2);
            }).style("opacity", 1);
        }

        //Toxicity 3
        if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level === 3);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.toxicity_level === 3);
            }).style("opacity", 1);
        }

        //Neutral stance CB is checked
        if (enabledHighlight.indexOf("highlight-neutral") > -1) {
            node.filter(function (d) {
                return (!d.positive_stance && !d.negative_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (!d.target.positive_stance && !d.target.negative_stance);
            }).style("opacity", 1);
        }

        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-positive") > -1) {
            node.filter(function (d) {
                return (d.positive_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.positive_stance);
            }).style("opacity", 1);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-negative") > -1) {
            node.filter(function (d) {
                return (d.negative_stance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.negative_stance);
            }).style("opacity", 1);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-group") > -1) {
            node.filter(function (d) {
                return (d.target_group);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.target_group);
            }).style("opacity", 1);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-person") > -1) {
            node.filter(function (d) {
                return (d.target_person);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.target_person);
            }).style("opacity", 1);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
            node.filter(function (d) {
                return (d.stereotype);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.stereotype);
            }).style("opacity", 1);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
            node.filter(function (d) {
                return (d.argumentation);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.argumentation);
            }).style("opacity", 1);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
            node.filter(function (d) {
                return (d.constructiveness);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.constructiveness);
            }).style("opacity", 1);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
            node.filter(function (d) {
                return (d.sarcasm);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.sarcasm);
            }).style("opacity", 1);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-mockery") > -1) {
            node.filter(function (d) {
                return (d.mockery);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.mockery);
            }).style("opacity", 1);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
            node.filter(function (d) {
                return (d.intolerance);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.intolerance);
            }).style("opacity", 1);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
            node.filter(function (d) {
                return (d.improper_language);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.improper_language);
            }).style("opacity", 1);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-insult") > -1) {
            node.filter(function (d) {
                return (d.insult);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.insult);
            }).style("opacity", 1);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
            node.filter(function (d) {
                return (d.aggressiveness);
            }).style("opacity", 1);

            link.filter(function (d) {
                return (d.target.aggressiveness);
            }).style("opacity", 1);
        }
    }

    function highlightByPropertyAND(node, link) {
        node.style("opacity", 1);
        link.style("opacity", 1);

        //Toxicity not 0
        if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 0);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 0);
            }).style("opacity", opacityValue);
        }

        //Toxicity not 1
        if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 1);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 1);
            }).style("opacity", opacityValue);
        }

        //Toxicity not 2
        if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 2);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 2);
            }).style("opacity", opacityValue);
        }

        //Toxicity not 3
        if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
            node.filter(function (d) {
                return (d.toxicity_level !== 3);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.toxicity_level !== 3);
            }).style("opacity", opacityValue);
        }

        //Neutral stance CB is checked
        if (enabledHighlight.indexOf("highlight-neutral") > -1) {
            node.filter(function (d) {
                return (d.positive_stance || d.negative_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (d.target.positive_stance || d.target.negative_stance);
            }).style("opacity", opacityValue);
        }

        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-positive") > -1) {
            node.filter(function (d) {
                return (!d.positive_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.positive_stance);
            }).style("opacity", opacityValue);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-negative") > -1) {
            node.filter(function (d) {
                return (!d.negative_stance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.negative_stance);
            }).style("opacity", opacityValue);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-group") > -1) {
            node.filter(function (d) {
                return (!d.target_group);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.target_group);
            }).style("opacity", opacityValue);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-person") > -1) {
            node.filter(function (d) {
                return (!d.target_person);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.target_person);
            }).style("opacity", opacityValue);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
            node.filter(function (d) {
                return (!d.stereotype);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.stereotype);
            }).style("opacity", opacityValue);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
            node.filter(function (d) {
                return (!d.argumentation);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.argumentation);
            }).style("opacity", opacityValue);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
            node.filter(function (d) {
                return (!d.constructiveness);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.constructiveness);
            }).style("opacity", opacityValue);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
            node.filter(function (d) {
                return (!d.sarcasm);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.sarcasm);
            }).style("opacity", opacityValue);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-mockery") > -1) {
            node.filter(function (d) {
                return (!d.mockery);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.mockery);
            }).style("opacity", opacityValue);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
            node.filter(function (d) {
                return (!d.intolerance);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.intolerance);
            }).style("opacity", opacityValue);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
            node.filter(function (d) {
                return (!d.improper_language);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.improper_language);
            }).style("opacity", opacityValue);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-insult") > -1) {
            node.filter(function (d) {
                return (!d.insult);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.insult);
            }).style("opacity", opacityValue);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
            node.filter(function (d) {
                return (!d.aggressiveness);
            }).style("opacity", opacityValue);

            link.filter(function (d) {
                return (!d.target.aggressiveness);
            }).style("opacity", opacityValue);
        }
    }

    function highlightNodesByPropertyOR(node, link) {
        if (enabledHighlight.length === 0) { //If no tag (toxicity, stance,...) checkbox is selected: highlight all

            nodes.forEach(function (d) {
                d.highlighted = 1;
            });
            node.style("opacity", 1);
        } else { //If some tag checkbox is selected behave as expected

            //First, unhighlight everything and set the parameter highlighted to 0
            nodes.forEach(function (d) {
                d.highlighted = 0;
            });
            node.style("opacity", opacityValue);

            //Then highlight by property OR
            highlightToxicityOR(node, enabledHighlight);
            highlightStanceOR(node, enabledHighlight);
            highlightTargetOR(node, enabledHighlight);
            highlightPositiveOR(node, enabledHighlight);
            highlightNegativeOR(node, enabledHighlight);
        }

        // If any stance checkboxes are checked, highlight the link from which it originates
        if (enabledHighlight.indexOf("highlight-stance-negative") > -1 ||
            enabledHighlight.indexOf("highlight-stance-positive") > -1 ||
            enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
            link.style("opacity", function (d) {
                return d.target.highlighted ? 1 : opacityValue;
            });
        } else {
            //Highlight only the edges whose both endpoints are highlighted
            link.style("opacity", function (d) {
                return (d.source.highlighted && d.target.highlighted) || ((d.source.parent === null || d.source.parent === undefined) && d.target.highlighted) ? 1 : opacityValue;
            });
        }
    }

    function highlightNodesByPropertyAND(node, link) {
        nodes.forEach(function (d) {
            d.highlighted = 1;
        });
        node.style("opacity", 1);

        //Then unhighlight by property AND
        highlightToxicityAND(node, enabledHighlight);
        highlightStanceAND(node, enabledHighlight);
        highlightTargetAND(node, enabledHighlight);
        highlightPositiveAND(node, enabledHighlight);
        highlightNegativeAND(node, enabledHighlight);

        // If any stance checkboxes are checked, highlight the link from which it originates
        if (enabledHighlight.indexOf("highlight-stance-negative") > -1 ||
            enabledHighlight.indexOf("highlight-stance-positive") > -1 ||
            enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
            link.style("opacity", function (d) {
                return d.target.highlighted ? 1 : opacityValue;
            });
        } else {
            //Highlight only the edges whose both endpoints are highlighted
            link.style("opacity", function (d) {
                return (d.source.highlighted && d.target.highlighted) || ((d.source.parent === null || d.source.parent === undefined) && d.target.highlighted) ? 1 : opacityValue;
            });
        }
    }

    function highlightLongestThread(node, link) {
        nodes.forEach(function (d) {
            d.highlighted = 0;
        });
        node.style("opacity", opacityValue);

        node.filter(function (d) {
            if (deepestNodesPath.includes(d)) d.highlighted = 1;
            return (deepestNodesPath.includes(d));
        }).style("opacity", 1);

        //Highlight only the edges whose both endpoints are highlighted
        link.style("opacity", function (d) {
            return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
        });
    }

    function highlightWidestLevels(node, link, levelsIndexes) {
        nodes.forEach(function (d) {
            d.highlighted = 0;
        });
        node.style("opacity", opacityValue);

        node.filter(function (d) {
            if (levelsIndexes.includes(d.depth)) d.highlighted = 1;
            //console.log(d);
            return (levelsIndexes.includes(d.depth));
        }).style("opacity", 1);

        //Highlight only the edges whose both endpoints are highlighted
        link.style("opacity", function (d) {
            return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
        });
    }

    /*END section */

    /**
     * Recursive function to count the total number of descendants and
     * the total number of nodes by toxicity
     * */
    function getDescendants(node) {

        if (!node.children && !node._children) {
            return {
                children: 0,
                toxicityLevel: node.toxicity_level,
                toxicity0: 0,
                toxicity1: 0,
                toxicity2: 0,
                toxicity3: 0
            };
        }
        var total = 0, childrenList = [], totalToxic0 = 0, totalToxic1 = 0, totalToxic2 = 0, totalToxic3 = 0;

        var children = node.children ?? node._children;


        if (children) {
            children.forEach(function (d) {

                childrenList = getDescendants(d);
                total += childrenList.children + 1;

                totalToxic0 += childrenList.toxicity0;
                totalToxic1 += childrenList.toxicity1;
                totalToxic2 += childrenList.toxicity2;
                totalToxic3 += childrenList.toxicity3;

                switch (childrenList.toxicityLevel) {
                    case 0:
                        totalToxic0 += 1;
                        break;
                    case 1:
                        totalToxic1 += 1;
                        break;
                    case 2:
                        totalToxic2 += 1;
                        break;
                    case 3:
                        totalToxic3 += 1;
                        break;
                }
            })
        }

        return {
            children: total,
            toxicityLevel: node.toxicity_level,
            toxicity0: totalToxic0,
            toxicity1: totalToxic1,
            toxicity2: totalToxic2,
            toxicity3: totalToxic3
        };
    }

    /**
     * Recursive function to compute the global statistics
     * counts nodes by toxicity and by targets
     * */
    function getStatisticValues(node) {
        if (!node.children) {
            return {
                children: 0,
                toxicityLevel: node.toxicity_level,
                toxicity0: 0,
                toxicity1: 0,
                toxicity2: 0,
                toxicity3: 0,
                totalTargGroup: 0,
                totalTargPerson: 0,
                totalTargStereotype: 0,
                totalTargNone: 0,
                targGroup: node.target_group,
                targPerson: node.target_person,
                targStereotype: node.stereotype,
                targNone: 0
            };
        }
        var total = 0, childrenList = [],
            totalToxic0 = 0, totalToxic1 = 0, totalToxic2 = 0, totalToxic3 = 0,
            totalTargGroup = 0, totalTargPerson = 0, totalTargStereotype = 0, totalTargNone = 0;

        if (node.children) {
            node.children.forEach(function (d) {
                childrenList = getStatisticValues(d);
                total += childrenList.children + 1;

                totalToxic0 += childrenList.toxicity0;
                totalToxic1 += childrenList.toxicity1;
                totalToxic2 += childrenList.toxicity2;
                totalToxic3 += childrenList.toxicity3;

                if (d.highlighted) {
                    switch (childrenList.toxicityLevel) {
                        case 0:
                            totalToxic0 += 1;
                            break;
                        case 1:
                            totalToxic1 += 1;
                            break;
                        case 2:
                            totalToxic2 += 1;
                            break;
                        case 3:
                            totalToxic3 += 1;
                            break;
                    }
                }

                //Targets are not exclusive
                childrenList.targGroup && d.highlighted ? totalTargGroup += childrenList.totalTargGroup + 1 : totalTargGroup += childrenList.totalTargGroup;
                childrenList.targPerson && d.highlighted ? totalTargPerson += childrenList.totalTargPerson + 1 : totalTargPerson += childrenList.totalTargPerson;
                childrenList.targStereotype && d.highlighted ? totalTargStereotype += childrenList.totalTargStereotype + 1 : totalTargStereotype += childrenList.totalTargStereotype;
                (!childrenList.targGroup && !childrenList.targPerson && !childrenList.targStereotype && d.highlighted) ? totalTargNone += childrenList.totalTargNone + 1 : totalTargNone += childrenList.totalTargNone;
            })
        }

        return {
            children: total,
            toxicityLevel: node.toxicity_level,
            toxicity0: totalToxic0,
            toxicity1: totalToxic1,
            toxicity2: totalToxic2,
            toxicity3: totalToxic3,
            totalTargGroup: totalTargGroup,
            totalTargPerson: totalTargPerson,
            totalTargStereotype: totalTargStereotype,
            totalTargNone: totalTargNone,
            targGroup: node.target_group,
            targPerson: node.target_person,
            targStereotype: node.stereotype,
            targNone: 0
        };
    }

    function setCircularPositions(node, angle) {
        //console.log("Node: ", node, angle)
        if (!node.children && !node._children) {
            node.x = canvasWidth / 2.0 + node.depth * Math.cos((node.parent.children?.length || node.parent._children?.length) * angle);
            node.y = canvasHeight / 2.0 + node.depth * Math.sin((node.parent.children?.length || node.parent._children?.length) * angle);
        }

        let children = node.children ?? node._children;

        if (children) {
            children.forEach(function (d) {
                //console.log("Quantity of children: ", (getStatisticValues(d).children || 1));
                let angle = 2 * Math.PI / (getStatisticValues(d).children || 1);
                setCircularPositions(d, angle);
                d.x = canvasWidth / 2.0 + d.depth * Math.cos((d.parent.children?.length || d.parent._children?.length) * angle);
                d.y = canvasHeight / 2.0 + d.depth * Math.sin((d.parent.children?.length || d.parent._children?.length) * angle);
                //console.log("Node: ", d, angle)
            })
        }
    }

    /*
    Functions
    * */
    function update(static_values_checked_param = true) {
        nodes = flatten(root); //get nodes as a list
        var links = d3.layout.tree().links(nodes);

        optimalK = getOptimalK(nodes); // compute optimal distance between nodes

        root.fixed = true;
        root.x = 0;
        root.y = 0;

        // Restart the force layout.
        force
            .nodes(nodes)
            .links(links);

        force.start();

        // Update the links…
        link = link.data(links, function (d) {
            return d.target.id;
        });

        // Enter any new links
        //NOTE we insert the links first, so the nodes appear above them
        link.enter().insert("line", "g")
            .attr("class", "link")
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                if (optimalK) return d.target.x + euclideanDistance(d.source, d.target) / optimalK * (d.source.x - d.target.x);
                return d.target.x;
            })
            .attr("y2", function (d) {
                if (optimalK) return d.target.y + euclideanDistance(d.source, d.target) / optimalK * (d.source.y - d.target.y);
                return d.target.y;
            })
            .style("stroke", function (d) {
                if (d.target.positive_stance && d.target.negative_stance) return colourBothStances; //Both against and in favour
                else if (d.target.positive_stance === 1) return colourPositiveStance; //In favour
                else if (d.target.negative_stance === 1) return colourNegativeStance; //Against
                else return colourNeutralStance; //Neutral comment
            })
            .style("stroke-width", getEdgeStrokeWidth());


        node = svgGroup.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id;
            });

        var drag = force.drag() //Define behaviour on drag
        .on("dragstart", dragstart);

        var isDblclick = false;
        var timeoutTiming = 350;
        var clickTimeout, dblclickTimeout;

        // Create a container so we draw several elements along with the node
        // Enter nodes
        var containerNode = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                if (d.parent && optimalK) {
                    var x_k, y_k;
                    x_k = d.parent.x + euclideanDistance(d, d.parent) / optimalK * (d.x - d.parent.x);
                    y_k = d.parent.y + euclideanDistance(d, d.parent) / optimalK * (d.y - d.parent.y);
                    return "translate(" + x_k + "," + y_k + ")";
                }
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on('mouseover', function (d) {
                var highlighted_nodes = node.filter(function (n) {
                    return n.highlighted;
                })[0].map(i => i.__data__.name); // don't ask..
                if (d !== root && highlighted_nodes.includes(d.name)) {
                    tooltipText = writeTooltipText(d);
                    tooltip.style("visibility", "visible")
                        .html(tooltipText);
                }
                else if(d == root){
                    tooltipText = writeTooltipRoot(d, totalNumberOfNodes, totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic);
                    tooltip.style("visibility", "visible").html(tooltipText);
                }
            })
            .on("mousemove", function (d) {
                // if (d !== root) {
                    return tooltip.style("top", (d3.mouse(document.querySelector(".overlay"))[1] - 130) + "px").style("left", (d3.mouse(document.querySelector(".overlay"))[0] - 490) + "px");
                // }
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            })
            .on("dblclick", dblclick) //Add function on double click over the node
            .on("click", function (d) {
                var eventDefaultPrevented = d3.event.defaultPrevented;
                if (!eventDefaultPrevented) {
                    clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function () {
                        if(!isDblclick) { // A simple click.
                            click(d, eventDefaultPrevented);
                            if (document.querySelector("#tree-container div.my-statistic").style.visibility === "visible") {
                                statisticBackground.html(writeStatisticText());
                            }
                        }
                    }, timeoutTiming);

                }
            })
            .call(drag); //We let it, so we can drag nodes when the svg ring targets are being shown

        /**
         * Defines the double click behaviour
         * If the node was in a fixed position, unfix it and remove the green ring associated
         *
         * NOTE: since the node is in a container, we can double click it even if it has SVGs or images showing around/above it
         * */
        function dblclick(d) {
            // double clicked! not click.
            isDblclick = true;
            clearTimeout(dblclickTimeout);
            dblclickTimeout = setTimeout(function () {
                isDblclick = false;
            }, timeoutTiming);

            d3.event.preventDefault();
            d3.event.stopPropagation();
            d3.select(this).select("circle").classed("fixed", d.fixed = false); //We delete the ring

            //d3.select(this).classed("fixed", d.fixed = false); //We delete the ring
            //NOTE: when the node is showing svg, you cannot double click
        }

        /**
         * Defines the dragging of a node
         * When the drag stops, fixes the node in its current position and makes appear a green ring
         * */
        function dragstart(d) {
            d3.event.sourceEvent.preventDefault();
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).select("circle").classed("fixed", d.fixed = true);
        }

        containerNode.append("circle")
            .attr("r", 10);

        //visualiseTargets(node); //Add images before the node circle

        // Update radius and colour of a node when collapsing it
        node.selectAll("circle").transition()
            .attr("r", function (d) {
                return computeNodeRadius(d);
            })
            .style("fill", function (d) {
                switch (d.toxicity_level) {
                    case 0:
                        return colourToxicity0;
                    case 1:
                        return colourToxicity1;
                    case 2:
                        return colourToxicity2;
                    case 3:
                        return colourToxicity3;
                    default:
                        return colourNewsArticle;
                }
            })
            .style("stroke", "black")
            .style("stroke-width", getNodeStrokeWidth())
            .style("z-index", 3);

        visualiseRootIcon(node); //Draw an icon for the root node

        visualiseRootIcon(node); //Draw an icon for the root node


        //Highlight nodes if necessary NOTE: it needs to be after the definition of the link
        //if(checkboxHighlightMenu.checked) checkboxOR.checked ? highlightByPropertyOR(node, link) : highlightByPropertyAND(node, link);

        // Exit any old nodes.
        node.exit().remove();

        // Exit any old links.
        link.exit().remove();

        //Dropdown menus
        // dropdownTargets.addEventListener("change", function () {
        //     selectTargetVisualization(node);
        // });
        // dropdownFeatures.addEventListener("change", function () {
        //     selectFeatureVisualization(node);
        // });

        var dotsFeaturesJQuery = $("#dots_icon_button");
        dotsFeaturesJQuery.off("change.update"); // remove duplicate listener
        // NOTE: In this layout, unlike the Tree layout, we can do it this way, since all nodes are updated each time,
        // and not only the new nodes added to the graph (variable nodeEnter in Tree layout).
        dotsFeaturesJQuery.on("change.update", function () {
            selectFeatureVisualization(node);
        });

        var glyphsFeaturesJQuery = $("#glyphs_icon_button");
        glyphsFeaturesJQuery.off("change.update"); // remove duplicate listener
        glyphsFeaturesJQuery.on("change.update", function () {
            selectFeatureVisualization(node);
        });

        /*SECTION  cb*/

        // Listeners related to the visualization of targets
        function getLengthFilterByName(array, stringToMatch, matchPositive = true) {
            return Array.from(array).filter(function (val) {
                if (matchPositive) {
                    return val.includes(stringToMatch);
                } else {
                    return !val.includes(stringToMatch);
                }
            }).length;
        }

        var static_values_checked = static_values_checked_param;
        jQuery("#static_values_button").click(function () {
            if (!static_values_checked) {
                document.getElementById('static_values_button').innerHTML = '&#8722;';
                static_values_checked = true;
                statisticBackground.style("visibility", "visible").html(writeStatisticText());
                console.log('[User]', user.split('/')[2], '| [interaction]', 'show_summary', ' | [Date]', Date.now());

            } else {
                document.getElementById('static_values_button').innerHTML = '&#43;'
                static_values_checked = false;
                statisticBackground.style("visibility", "hidden").html(writeStatisticText());
                console.log('[User]', user.split('/')[2], '| [interaction]', 'hide_summary', ' | [Date]', Date.now());

            }
        });

        try {
            $(document).ready(function () {

                var checkboxesTargetsJQuery = $("input[type=checkbox][name=cbTargets]");
                var checkboxesJQuery = $("input[type=checkbox][name=cbFeatures]");
                var checkboxesHighlightGroupORJQuery = $("input[name=cbHighlightOR]");
                var checkboxesHighlightGroupANDJQuery = $("input[name=cbHighlightAND]");

                checkboxesTargetsJQuery.each(function () {
                    $( this ).off("change.update"); // remove duplicate listener
                    $( this ).on('change.update', function () {
                        enabledTargets =
                            Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        if ($( this ).checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        }
                        selectTargetVisualization(node);
                    })
                });

                // Use Array.forEach to add an event listener to each checkbox.
                // Draw feature circles
                checkboxesJQuery.each(function () {
                    $( this ).off("change.update"); // remove duplicate listener
                    $( this ).on('change.update', function () {
                        enabledFeatures =
                            Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                        if ($( this ).checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        }
                        selectFeatureVisualization(node);

                    })
                });


    // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupORJQuery.each(function () {
                    $( this ).off("change.update"); // remove duplicate listener
                    $( this ).on('change.update', function () {
                        enabledHighlight =
                            Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        var filteredOriginalToxicity = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-toxicity-");
                        var filteredCompareToxicity = getLengthFilterByName(Array.from(enabledHighlight), "highlight-toxicity-");
                        document.getElementById('highlight-OR-selectAll-toxicity').checked = filteredOriginalToxicity === filteredCompareToxicity;

                        var filteredOriginalStance = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-stance-");
                        var filteredCompareStance = getLengthFilterByName(Array.from(enabledHighlight), "highlight-stance-");
                        document.getElementById('highlight-OR-selectAll-stance').checked = filteredOriginalStance === filteredCompareStance;

                        var filteredOriginalTarget = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-target-");
                        var filteredCompareTarget = getLengthFilterByName(Array.from(enabledHighlight), "highlight-target-");
                        document.getElementById('highlight-OR-selectAll-target').checked = filteredOriginalTarget === filteredCompareTarget;

                        var filteredOriginalFeatures = getLengthFilterByName(Array.from(checkboxesHighlightGroupOR).map(i => i.value), "highlight-features-");
                        var filteredCompareFeatures = getLengthFilterByName(Array.from(enabledHighlight), "highlight-features-");
                        document.getElementById('highlight-OR-selectAll-features').checked = filteredOriginalFeatures === filteredCompareFeatures;
                        if ($( this ).checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        }
                        checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
                        if (static_values_checked) {
                            statisticBackground.html(writeStatisticText());
                        }
                    })
                });

                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupANDJQuery.each(function () {
                    $( this ).off("change.update"); // remove duplicate listener
                    $( this ).on('change.update', function () {
                        enabledHighlight =
                            Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        var filteredOriginalTarget = getLengthFilterByName(Array.from(checkboxesHighlightGroupAND).map(i => i.value), "highlight-target-");
                        var filteredCompareTarget = getLengthFilterByName(Array.from(enabledHighlight), "highlight-target-");
                        document.getElementById('highlight-AND-selectAll-target').checked = filteredOriginalTarget === filteredCompareTarget;

                        var filteredOriginalFeatures = getLengthFilterByName(Array.from(checkboxesHighlightGroupAND).map(i => i.value), "highlight-features-");
                        var filteredCompareFeatures = getLengthFilterByName(Array.from(enabledHighlight), "highlight-features-");
                        document.getElementById('highlight-AND-selectAll-features').checked = filteredOriginalFeatures === filteredCompareFeatures;

                        if ($( this ).checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $( this ).name + '_' + $( this ).value, " | [Date]", Date.now());
                        }
                        checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
                        if (static_values_checked) {
                            statisticBackground.html(writeStatisticText());
                        }
                    })
                });

                // To notify the DOM that the ready function has finished executing.
                // This to be able to manage the filters if it is given the case that the code of the onLoad function finishes before.
                const event = new Event('codeReady');

                // Dispatch the event.
                document.querySelector("body").dispatchEvent(event);

                codeReady = true;
            });
            /*END section cb*/

        } catch (TypeError) {
            console.error("Error attaching buttons... trying again...");
        }

        /**
         * Gets the array of nodes belonging to the deepest threads, highlights them,
         * updating the network statistics, and displays the result in the chat
         */
        $(container).off("longest_thread");
        $(container).on("longest_thread", function () {
            let deepestNodes = getDeepestNodes(root);

            var textMsg;
            if (deepestNodes.length > 1) {
                textMsg = "There are " + deepestNodes.length + " threads with a maximum depth of " + deepestNodes[0].depth;
            } else {
                textMsg = "The longest thread has a depth of " + deepestNodes[0].depth;
            }

            injectIntentConversation(textMsg);

            deepestNodesPath = getDeepestNodesPath(root, deepestNodes);
            // document.getElementById("jsConnector").innerHTML = ["longest_thread", deepestNodes.length, deepestNodes[0].depth].toString();
            highlightLongestThread(node, link);

            if (static_values_checked) {
                statisticBackground.html(writeStatisticText());
            }
        });

        /**
         * Obtains the indices of the widest levels of the graph, highlights the nodes that belong to those levels,
         * updates the network statistics, and displays the result in the chat
         */
        $(container).off("widest_level");
        $(container).on("widest_level", function () {
            let widestLevels = getWidestLevels(root, getTreeHeight(root));
            var textMsg;
            if (widestLevels[0].length > 1) {
                textMsg = "There are " + widestLevels[0].length + " levels &#91;" + widestLevels[0] + "&#93; with a maximum width of " + widestLevels[1];
            } else {
                textMsg = "The widest level is level " + widestLevels[0][0] + " which has a width of " + widestLevels[1];
            }

            injectIntentConversation(textMsg);

            highlightWidestLevels(node, link, widestLevels[0]);

            if (static_values_checked) {
                statisticBackground.html(writeStatisticText());
            }
        });

        checkboxesTargets.forEach(function (checkboxItem) {
            enabledTargets =
                Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

            selectTargetVisualization(node);
        });

        checkboxes.forEach(function (checkboxItem) {
            enabledFeatures =
                Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

            selectFeatureVisualization(node);
        });

        //Enable checkboxes and dropdown menu + show features if they are selected
        checkboxesPropertyFeature.forEach(function (checkboxItem) {
            //console.log("remove");
            checkboxItem.removeAttribute('disabled');
        });
        checkboxesPositioningFeature.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute('disabled');
        });
        checkboxes.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute('disabled');
        });
        // dropdownFeatures.removeAttribute('disabled');

        checkButtons.forEach(function (button) {
                button.removeAttribute('disabled');
            }
        );
        if (!document.querySelector("input[value=dot-feat]").checked && !document.querySelector("input[value=cheese-feat]").checked) {
            document.querySelector("input[value=dot-feat]").checked = true;
        }

        // if (!document.querySelector("input[value=on-node]").checked && !document.querySelector("input[value=node-outside]").checked) {
        //     document.querySelector("input[value=on-node]").checked = true;
        // }
        // selectFeatureVisualization(node);

        //Listener related to the visualization of features
        // checkboxFeatureMenu.addEventListener('change', function () {
        //     if (this.checked) { //Enable checkboxes and dropdown menu + show features if they are selected
        //         checkboxesPropertyFeature.forEach(function (checkboxItem) {
        //             console.log("remove");
        //             checkboxItem.removeAttribute('disabled');
        //         });
        //         checkboxesPositioningFeature.forEach(function (checkboxItem) {
        //             checkboxItem.removeAttribute('disabled');
        //         });
        //         checkboxes.forEach(function (checkboxItem) {
        //             checkboxItem.removeAttribute('disabled');
        //         });
        //         // dropdownFeatures.removeAttribute('disabled');
        //
        //         checkButtons.forEach(function (button) {
        //                 button.removeAttribute('disabled');
        //             }
        //         );
        //         if (!document.querySelector("input[value=dot-feat]").checked && !document.querySelector("input[value=cheese-feat]").checked) {
        //             document.querySelector("input[value=dot-feat]").checked = true;
        //         }
        //
        //         // if (!document.querySelector("input[value=on-node]").checked && !document.querySelector("input[value=node-outside]").checked) {
        //         //     document.querySelector("input[value=on-node]").checked = true;
        //         // }
        //         selectFeatureVisualization(node);
        //
        //     } else { //Disable checkboxes and dropdown menu + remove all the features
        //         checkboxesPropertyFeature.forEach(function (checkboxItem) {
        //             checkboxItem.setAttribute('disabled', 'disabled');
        //         });
        //         checkboxesPositioningFeature.forEach(function (checkboxItem) {
        //             checkboxItem.setAttribute('disabled', 'disabled');
        //         });
        //         // document.getElementById("feature-over-node-or-outside").style.display = "none";
        //         // dropdownFeatures.setAttribute('disabled', 'disabled');
        //
        //         checkboxes.forEach(function (checkboxItem) {
        //             checkboxItem.setAttribute('disabled', 'disabled');
        //         });
        //         checkButtons.forEach(function (button) {
        //                 button.setAttribute('disabled', 'disabled');
        //             }
        //         );
        //
        //         hideFeatureImages(); //Hide all features when the cb is unchecked
        //     }
        // });

        // If this checkbox is checked, uncheck the other one and visualise features
        // cbFeatureInside.addEventListener('change', function () {
        //     this.checked ? cbFeatureOutside.checked = false : cbFeatureOutside.checked = true;
        //     selectFeatureVisualization(node);
        // });
        // // If this checkbox is checked, uncheck the other one and visualise features
        // cbFeatureOutside.addEventListener('change', function () {
        //     this.checked ? cbFeatureInside.checked = false : cbFeatureInside.checked = true;
        //     selectFeatureVisualization(node);
        // });


        //Listener related to highlighting nodes and edges
        // checkboxHighlightMenu.addEventListener('change', function () {
        //     if (this.checked) {
        //         checkboxesProperty.forEach(function (checkboxItem) {
        //             checkboxItem.removeAttribute('disabled');
        //         });
        //         checkboxesHighlightGroup.forEach(function (checkboxItem) {
        //             checkboxItem.removeAttribute('disabled');
        //         });
        //
        //         //If no property AND/OR was selected, highlight by property AND
        //         if (!document.querySelector("input[value=and-group]").checked && !document.querySelector("input[value=or-group]").checked) {
        //             document.querySelector("input[value=and-group]").checked = true;
        //             highlightNodesByPropertyAND(node, link);
        //         } else {
        //             checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
        //         }
        //
        //     } else { //Disable checkboxes
        //         checkboxesProperty.forEach(function (checkboxItem) {
        //             checkboxItem.setAttribute('disabled', 'disabled');
        //         });
        //         checkboxesHighlightGroup.forEach(function (checkboxItem) {
        //             checkboxItem.setAttribute('disabled', 'disabled');
        //         });
        //         //We make all nodes and links visible again with full opacity
        //         node.style("opacity", 1);
        //         link.style("opacity", 1);
        //     }
        // });

        var checkboxANDJQuery = $("input[type=radio][name=cbHighlightProperty][value=and-group]");
        var checkboxORJQuery = $("input[type=radio][name=cbHighlightProperty][value=or-group]");

        // If AND is selected, uncheck the OR and highlight by property AND
        checkboxANDJQuery.off("change.update"); // remove duplicate listener
        checkboxANDJQuery.on("change.update", function () {
            if (this.checked) {
                checkboxOR.checked = false;

                enabledHighlight =
                    Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                highlightNodesByPropertyAND(node, link);
            } else {
                checkboxOR.checked = true;
                enabledHighlight =
                    Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                highlightNodesByPropertyOR(node, link);
            }
        });
        // If OR is selected, uncheck the AND and highlight by property OR
        checkboxORJQuery.off("change.update"); // remove duplicate listener
        checkboxORJQuery.on("change.update", function () {
            if (this.checked) {
                checkboxAND.checked = false;

                enabledHighlight =
                    Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                highlightNodesByPropertyOR(node, link);
            } else {
                checkboxAND.checked = true;
                enabledHighlight =
                    Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                highlightNodesByPropertyAND(node, link);
            }
        });

        checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);

        /* NOTE: the nodes that get to the function update()
       are root and the ones that were collapsed
       Therefore, for this nodes that are getting uncollapsed we want to:
       - show the targets if necessary
       - show the features if necessary
       - highlight nodes and edges
       * */
        selectTargetVisualization(node);
        selectFeatureVisualization(node);
        // checkboxFeatureMenu.checked ? selectFeatureVisualization(node) : hideFeatureImages();
        //if (checkboxHighlightMenu.checked) checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);

    } //END update

    function euclideanDistance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    function tick() {
        link.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        //Aqui obtendremos la posicion del padre y pondremos el hijo a distancia k
        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    }

    /**
     * Defines zoom listener
     * */
    function zoom() {
        var zoom = d3.event;
        svg.attr("transform", "translate(" + zoom.translate + ")scale(" + zoom.scale + ")");
        currentScale = zoom.scale;
    }

    /**
     * Compute the optimal distance between nodes
     * as the algorithm of Fruchterman-Reingold "Graph drawing by force-directed placement"
     * */
    function getOptimalK(nodes) {
        return Math.pow(height * width / nodes.length, 0.5);
    }


    /**
     * Clicked node behaviour
     * Compute descendants information
     * Toggle children on click
     * Updates the layout
     * */
    function click(d, eventDefaultPrevented) {
        //Compute children data (quantity and how many with each toxicity) before collapsing the node
        var descendantsData = getDescendants(d);
        d.numberOfDescendants = descendantsData.children;
        d.descendantsWithToxicity0 = descendantsData.toxicity0;
        d.descendantsWithToxicity1 = descendantsData.toxicity1;
        d.descendantsWithToxicity2 = descendantsData.toxicity2;
        d.descendantsWithToxicity3 = descendantsData.toxicity3;

        if (!eventDefaultPrevented) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
        }
        update(document.querySelector("#tree-container div.my-statistic").style.visibility === "visible");
    }

    /**
     * Returns a list of all nodes under the root.
     * */
    function flatten(root) {
        var nodes = [], i = 0;

        function recurse(node, parent) {
            node.parent = parent; //We assign a parent to the node
            if (parent) node.depth = node.parent.depth + 1; //If parent is not null
            if (node.children) node.children.forEach(element => recurse(element, node));
            if (!node.id) node.id = ++i;
            nodes.push(node);
        }

        root.depth = 0;
        recurse(root, null);
        return nodes;
    }

    var svgGroup = svg.append("g"); //We define it here, otherwise, svg is not defined
    root = json;

    document.querySelector("#tree-container div.my-statistic").style.visibility = "visible";
    update(true);

    force.alpha(1.5); //Restart the timer of the cooling parameter with a high value to reach better initial positioning

    $(document).ready(function () {
        zoomListener.scale(initialZoomScale);
        zoomListener.translate([canvasWidth / 2, canvasHeight / 2]);
        zoomListener.event(svg);
    });

    /**
     * Wrap call to compute statistics and to write them in a hover text
     * */
    function computeStatistics() {
        //I compute the values for the statistic data showing in the background
        var listStatistics = getStatisticValues(root);
        var totalNumberOfNodes = listStatistics.children;

        var totalNotToxic = listStatistics.toxicity0,
            totalMildlyToxic = listStatistics.toxicity1,
            totalToxic = listStatistics.toxicity2,
            totalVeryToxic = listStatistics.toxicity3;

        var totalGroup = listStatistics.totalTargGroup,
            totalPerson = listStatistics.totalTargPerson,
            totalStereotype = listStatistics.totalTargStereotype,
            totalNone = listStatistics.totalTargNone;
    }

    //I compute the values for the statistic data showing in the background
    var listStatistics = getStatisticValues(root);
    var totalNumberOfNodes = listStatistics.children;

    var totalNotToxic = listStatistics.toxicity0,
        totalMildlyToxic = listStatistics.toxicity1,
        totalToxic = listStatistics.toxicity2,
        totalVeryToxic = listStatistics.toxicity3;

    var totalGroup = listStatistics.totalTargGroup,
        totalPerson = listStatistics.totalTargPerson,
        totalStereotype = listStatistics.totalTargStereotype,
        totalNone = listStatistics.totalTargNone;

    function writeStatisticText() {
        // var statisticText = "<span style='font-size: 22px;'> Summary of " + sel_item.split('/')[2] + "</span>";
        var statisticText = "<table style='width: 530px; margin-top: 50px; z-index: 100;'>";

        var listStatisticsUpdate = getStatisticValues(root);

        var totalNotToxicUpdate = listStatisticsUpdate.toxicity0,
            totalMildlyToxicUpdate = listStatisticsUpdate.toxicity1,
            totalToxicUpdate = listStatisticsUpdate.toxicity2,
            totalVeryToxicUpdate = listStatisticsUpdate.toxicity3;

        var totalGroupUpdate = listStatisticsUpdate.totalTargGroup,
            totalPersonUpdate = listStatisticsUpdate.totalTargPerson,
            totalStereotypeUpdate = listStatisticsUpdate.totalTargStereotype,
            totalNoneUpdate = listStatisticsUpdate.totalTargNone;

        var statTitlesToxicity = ["Not toxic", "Mildly toxic", "Toxic", "Very toxic"];
        var statTitlesTargets = ["Target group", "Target person", "Stereotype", "None"];
        var statValuesTox = [totalNotToxicUpdate, totalMildlyToxicUpdate, totalToxicUpdate, totalVeryToxicUpdate];
        var statValuesTarg = [totalGroupUpdate, totalPersonUpdate, totalStereotypeUpdate, totalNoneUpdate];

        for (var i = 0; i < statTitlesToxicity.length; i++) {
            statisticText += "<tr style='font-size: 20px;'>"; //Start table line

            //Write toxicity and target line
            statisticText += "<td style='font-size: 20px; width: 400px; margin-right: 25px;'>" + "<img src=" + pf + toxicityLevelsPath[i] + " style='width: 35px; margin-right: 15px; margin-left: 25px;'>" + statTitlesToxicity[i].toString() + ": " + "<td style='padding-right: 55px;'>" + statValuesTox[i].toString() + "</td>";
            statisticText += "<td style='font-size: 20px; width: 400px;'>" + "<img src=" + pt + targetImagesPath[i] + " style='width: 25px; margin-right: 15px; margin-left: 25px;'>" + statTitlesTargets[i].toString() + ": " + "<td>" + statValuesTarg[i].toString() + "</td>";

            statisticText += "</tr>"; //End table line
        }

        statisticText += "</table>";
        return statisticText;
    }

    console.log('[User]', user.split('/')[2], '| [interaction]', 'Force_layout_loaded', ' | [Date]', Date.now());

/*******************************
*   Categorization Functions   *
********************************/

    /**
     * Function that returns the height of a tree given its root node
     * @param node tree root
     * @returns {number} number of levels in subtree
     */
    function getTreeHeight(node) {
        if (!node.children) {
            return 0;
        }
        let maxHeight = 0;
        if (node.children) {
            node.children.forEach(function (d) {
                let currentHeight = getTreeHeight(d)+1;
                if (currentHeight > maxHeight) {
                    maxHeight = currentHeight;
                }
            });
        }
        return maxHeight;
    }

    /**
     * Finding the deepest nodes in a hierarchy
     * @param node tree root
     * @returns {Array} array of nodes with greater depth
     */
    function getDeepestNodes(node) {
        let hierarchy = d3.hierarchy(node);
        let lenght = d3.max(hierarchy.descendants(), d => d.depth);
        return hierarchy.descendants().filter(function (d) {
            return (d.depth === lenght);
        });
    }

    /**
     * Finds the path between end nodes and the root in a hierarchy
     * By default, if the parameter endNodes is not provided, the function finds the deepest nodes path in a hierarchy
     * @param root tree root
     * @param endNodes End nodes array to find their thread to the root
     * @returns {Array} array of nodes that belong to the threads between the end nodes and the root.
     * If the parameter endNodes is not provided, returns array of nodes that belong to the threads with greater depth.
     */
    function getDeepestNodesPath(root, endNodes = getDeepestNodes(root)) {
        let nodesPath = [];
        let deepestNodes = endNodes;
        let currentNode;
        for (let i = 0; i < deepestNodes.length; i++) {
            currentNode = deepestNodes[i];
            while(currentNode.data !== root){
                nodesPath.push(currentNode.data);
                currentNode = currentNode.parent;
            }
        }
        nodesPath.push(root);
        return nodesPath;
    }

    /**
     * auxiliar function that returns the number of nodes in a given level
     * @param node tree root
     * @param current current level in tree
     * @param level desired level to scan
     * @param nodeList list of nodes at desired level
     */
    function getNodesInLevel(node, current, level, nodeList) {
        nodeList[current] += 1;
        if (current < level && node.children) {
            node.children.forEach(function (d) {
               getNodesInLevel(d, current+1, level, nodeList);
            });
        }
    }

    /**
     * function that returns the widest levels of a subtree and its width value, given its root node
     * @param node tree root
     * @param height depth of tree
     * @returns {Array} graph level indexes with the greatest width
     */
    function getWidestLevels(node, height) {
        var nodeList = new Array(height+1).fill(0);
        if (height === 0) { return [[0],1]; }
        getNodesInLevel(node, 0, height, nodeList);
        const max = Math.max(...nodeList);
        const indexes = [];
        for (let index = 0; index < nodeList.length; index++) {
          if (nodeList[index] === max) {
            indexes.push(index);
          }
        }
        return [indexes,max];
    }
});