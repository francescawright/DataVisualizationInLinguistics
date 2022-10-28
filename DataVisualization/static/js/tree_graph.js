/*Copyright (c) 2013-2016, Rob Schmuecker
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

// Variable to check if the ready function code has been completely executed
var codeReady = false;

/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadius(d, edgeLength = 300) {
    /*
        If node has children,
        more than 2: new radius = 16 + 3 * (#children - 2)
        2 children: new radius = 16
        1 child: new radius = 13
        0 children: new radius = 10
    * */
    d.radius = 10;
    if ((d.children === undefined || d.children === null) && (d._children === undefined || d._children === null)) return d.radius; //If no children, radius = 10

    var children = d.children ?? d._children; //Assign children collapsed or not

    children.length > 2 ? d.radius = 16 + 3 * (children.length - 2) // more than 2 children
        :
        children.length === 2 ? d.radius = 16 //2 children
            :
            d.radius = 13; //One child
    //Avoid the root node from being so large that overlaps/hides its children
    if (d.parent === undefined && d.radius > edgeLength / 2) d.radius = edgeLength / 2.0;
    return d.radius;
}

/**
 * Computes the borders of a box containing our nodes
 * */
function computeDimensions(nodes) {
    /* Note our coordinate system:
     *
     *                     | X negative
     *                     |
     * Y negative <--------|-------> Y positive
     *                     |
     *                     | X positive
     * And note we need to take into account the radius of the node
     * */
    var minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const n of nodes) {
        if ((n.x - n.radius) < minX) minX = n.x - n.radius;
        if ((n.y - n.radius) < minY) minY = n.y - n.radius;
        if ((n.x + n.radius) > maxX) maxX = n.x + n.radius;
        if ((n.y + n.radius) > maxY) maxY = n.y + n.radius;
    }
    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}

let currentZoomScale;

function getNodeStrokeWidth() {
    return 1.5;
}

/**
 * Set edge stroke width based on current zoom value
 * */
function getEdgeStrokeWidth() {
    //console.log("Zoom: ", currentZoomScale)
    switch (true) {
        case (currentZoomScale > 7):
            return 1;
        case (currentZoomScale > 6):
            return 2;
        case (currentZoomScale > 4):
            return 3;
        case (currentZoomScale > 3):
            return 4;
        case (currentZoomScale > 1):
            return 5;
        case (currentZoomScale > 0.6):
            return 6;
        case (currentZoomScale > 0.5):
            return 7;
        case (currentZoomScale > 0.4):
            return 8;
        case (currentZoomScale > 0.3):
            return 9;
        case (currentZoomScale > 0.2):
            return 10;
        case (currentZoomScale > 0.1):
            return 11;
        case (currentZoomScale > 0.075):
            return 15;
        case (currentZoomScale > 0):
            return 20;
    }
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

var rootPath = pr;
var colourUnhighlightedToxicity0 = "#f0f0f0",
    colourUnhighlightedToxicity1 = "#d6d6d6",
    colourUnhighlightedToxicity2 = "#ababab",
    colourUnhighlightedToxicity3 = "#6b6b6b",
    colourUnhighlightedCollapsed1Son = "cfdbeb";

function colourUnhighlightedNode(d) {
    if (d._children?.length === 1) return colourUnhighlightedCollapsed1Son;
    switch (d.toxicity_level) {
        case 0:
            return colourUnhighlightedToxicity0;
        case 1:
            return colourUnhighlightedToxicity1;
        case 2:
            return colourUnhighlightedToxicity2;
        case 3:
            return colourUnhighlightedToxicity3;
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
            return (d.toxicity_level === 0);
        }).style("opacity", 1);
    }

    //Toxicity 1
    if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 1) d.highlighted = 1;
            return (d.toxicity_level === 1);
        }).style("opacity", 1);
    }

    //Toxicity 2
    if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 2) d.highlighted = 1;
            return (d.toxicity_level === 2);
        }).style("opacity", 1);
    }

    //Toxicity 3
    if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 3) d.highlighted = 1;
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
        }) //.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Positive stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
        node.filter(function (d) {
            if (!d.positive_stance) d.highlighted = 0;
            return (!d.positive_stance);
        }) //.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
        node.filter(function (d) {
            if (!d.negative_stance) d.highlighted = 0;
            return !d.negative_stance;
        }) //.select("circle.nodeCircle")
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
treeJSON = d3.json(dataset, function (error, treeData) {

    // Calculate total nodes, max label length
    var totalNodes = 0;
    var edgeLength = 300;

    // Misc. variables
    var i = 0;
    var duration = 750;
    var root, rootName = "News Article";
    var nodes;

    /* Colours
     * */
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


    var objRoot = {
        class: "rootNode",
        id: "rootNode",
        fileName: "root.png"
    };
    var imageOffset = 4; //Radii size difference between a node and its associated image
    var imgRatio = 10; //Percentage of difference between the radii of a node and its associated image

    var colorFeature = ["#1B8055","#90F6B2",
        "#97CFFF", "#1795FF", "#0B5696",
        "#E3B7E8", "#A313B3", "#5E1566"
    ];

    var colorDevtools = ["#88FF00", "#FFBB00",
        "#FF5500", "#90F6B2", "#1B8055",
        "#97CFFF", "#1795FF", "#0B5696"
    ];

    /* Targets: size, position, local path, objects to draw the target as ring
     * */
    var targetIconHeight = 15,
        targetIconWidth = 15,
        targetIconGroupX = -30,
        targetIconPersonX = -50,
        targetIconStereotypeX = -70,
        targetIconY = -10; //Size and relative position of targets drawn as icons
    var pathTargets = pt;

    var objTargetGroupRing = {
            class: "targetGroup",
            id: "targetGroup",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Group.png"
        },
        objTargetPersonRing = {
            class: "targetPerson",
            id: "targetPerson",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Person.png"
        },
        objTargetStereotypeRing = {
            class: "targetStereotype",
            id: "targetStereotype",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Stereotype.png"
        },
        objTargetGrayRing = {
            class: "targetGray",
            id: "targetGray",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Gray.png"
        };

    /* Features: size, position, local path
     * */
    var cheeseX = 15,
        cheeseY = -10,
        cheeseHeight = 20,
        cheeseWidth = 20;
    var pathFeatures = pf;

    // Objects for toxicities for Ecem tests
    var objToxicity0 = {
            class: "toxicity0",
            id: "toxicity0",
            selected: 1,
            fileName: "Level0.svg"
        },
        objToxicity1 = {
            class: "toxicity1",
            id: "toxicity1",
            selected: 1,
            fileName: "Level1.svg"
        },
        objToxicity2 = {
            class: "toxicity2",
            id: "toxicity2",
            selected: 1,
            fileName: "Level2.svg"
        },
        objToxicity3 = {
            class: "toxicity3",
            id: "toxicity3",
            selected: 1,
            fileName: "Level3.svg"
        };
    var drawingAllInOne = false; //if we are drawing all together or separated


    // size of the diagram
    var viewerWidth = 100;
    var viewerHeight = 400;

    var canvasHeight = 1000,
        canvasWidth = 2200; //Dimensions of our canvas (grayish area)
    var initialZoom, initialX, initialY; //Initial zoom and central coordinates of the first visualization of the graph

    var separationHeight = 10; //Desired separation between two node brothers
    var radiusFactor = 2; // The factor by which we multiply the radius of a node when collapsed with more than 2 children

    var opacityValue = 0.1; // Opacity when a value is not highlighted
    var tooltipText; // The variable displaying the information of a node inside a floating rectangle

    //var N = 0.6 * canvasHeight / 40; //(15 by default)

    /* Vars for tendency and hierarchy calculations */
    var N = document.getElementById("input-n-field").value;
    var L = document.getElementById("input-l-field").value;
    var GFcomp = document.getElementById("input-gfcomp-field").value;
    var GFelon = document.getElementById("input-gfelon-field").value;
    var d_lvl = document.getElementById("input-d-field").value; //this is d, i was too lazy to change all other vars. names
    var tol = document.getElementById("input-tol-field").value;
    //var eps = document.getElementById("input-eps-field").value;

    root = treeData; //Define the root

    // Used to obtain the nodes belonging to the deepest thread
    var deepestNodesPath;

    /* Creation of the tree with nodeSize
     * We indicate the reserved area for each node as [height, width] since our tree grows horizontally
     * Sorts nodes by level of toxicity (from lower to higher)
     *
     * NOTE: tree must be sorted at the creation of the tree, otherwise when collapsing and uncollapsing a node
     * the order of the nodes might change, disturbing the user mental map of the tree
     *
     * */
    var tree = d3.layout.tree()
        .nodeSize(root.children.length, 0) //NOTE the width is overwritten later
        .sort(function (a, b) {
            return d3.ascending(a.toxicity_level, b.toxicity_level); //NOTE: this avoids the tree being sorted and changed when collapsing a node
        });

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });
    // Hover rectangle in which the information of a node is displayed
    var tooltip = d3.select(container)
        .append("div")
        .attr("class", "my-tooltip") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "60")
        .style("visibility", "hidden");

    // Div where the title of the "Static Values" is displayed
    var statisticBackground = d3.select(container)
        .append("div")
        .attr("class", "my-statistic") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "1") //it has no change
        .style("visibility", "visible")
        .style("right", "320px");


    /* SECTION Zoom*/
    var zoomLabel = document.getElementById("zoom_level");
    var XLabel = document.getElementById("position_x");
    var YLabel = document.getElementById("position_y");

    /*SECTION checkboxes*/
    // var checkboxId = document.querySelector("input[name=cbId]");

    // var checkboxStaticValues = document.querySelector("input[name=cbStaticValues]");

    //Check the values of the checkboxes and do something
    var checkbox = document.querySelector("input[name=cbTargets]");
    var checkboxesTargets = [document.getElementById("target-group"), document.getElementById("target-person"), document.getElementById("target-stereotype")]; //document.querySelectorAll("input[type=checkbox][name=cbTargets]");
    var checkboxesDevtools = document.querySelectorAll("input[type=checkbox][name=cbDevtools]");

    let enabledTargets = []; //Variable which contains the string of the enabled options to display targets

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

    // Objects for target images
    var objTargetGroup = {
            class: "targetGroup",
            id: "targetGroup",
            selected: enabledTargets.indexOf("target-group"),
            x: -30,
            y: -10,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Group.svg"
        },
        objTargetPerson = {
            class: "targetPerson",
            id: "targetPerson",
            selected: enabledTargets.indexOf("target-person"),
            x: -50,
            y: -10,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Person.svg"
        },
        objTargetStereotype = {
            class: "targetStereotype",
            id: "targetStereotype",
            selected: enabledTargets.indexOf("target-stereotype"),
            x: -70,
            y: -10,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "Stereotype.svg"
        };


    var objTargetGroupInside = {
            class: "targetGroup",
            id: "targetGroup",
            selected: enabledTargets.indexOf("target-group"),
            x: -0.9,
            y: -0.8,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "icons/Group.svg"
        },
        objTargetPersonInside = {
            class: "targetPerson",
            id: "targetPerson",
            selected: enabledTargets.indexOf("target-person"),
            x: -0.5,
            y: 0,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "icons/Person.svg"
        },
        objTargetStereotypeInside = {
            class: "targetStereotype",
            id: "targetStereotype",
            selected: enabledTargets.indexOf("target-stereotype"),
            x: -0.1,
            y: -0.8,
            height: targetIconHeight,
            width: targetIconWidth,
            fileName: "icons/Stereotype.svg"
        };


    // Objects for feature images
    var objFeatArgumentation = {
            class: "featArgumentation",
            id: "featArgumentation",
            selected: enabledFeatures.indexOf("argumentation"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Argumentation.svg"
        },
        objFeatConstructiveness = {
            class: "featConstructiveness",
            id: "featConstructiveness",
            selected: enabledFeatures.indexOf("constructiveness"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Constructiveness.svg"
        },
        objFeatSarcasm = {
            class: "featSarcasm",
            id: "featSarcasm",
            selected: enabledFeatures.indexOf("sarcasm"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Sarcasm.svg"
        },
        objFeatMockery = {
            class: "featMockery",
            id: "featMockery",
            selected: enabledFeatures.indexOf("mockery"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Mockery.svg"
        },
        objFeatIntolerance = {
            class: "featIntolerance",
            id: "featIntolerance",
            selected: enabledFeatures.indexOf("intolerance"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Intolerance.svg"
        },
        objFeatImproper = {
            class: "featImproper",
            id: "featImproper",
            selected: enabledFeatures.indexOf("improper_language"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Improper.svg"
        },
        objFeatInsult = {
            class: "featInsult",
            id: "featInsult",
            selected: enabledFeatures.indexOf("insult"),
            x: cheeseX,
            y: cheeseY,
            height: cheeseHeight,
            width: cheeseWidth,
            fileName: "Insult.svg"
        },
        objFeatAggressiveness = {
            class: "featAggressiveness",
            selected: enabledFeatures.indexOf("aggressiveness"),
            id: "featAggressiveness",
            x: cheeseX,
            y: cheeseY,
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


    // var dropdownTargets = document.getElementById("dropdown-targets");
    var dropdownFeatures = document.getElementById("dropdown-features");

    var dotsFeatures = document.getElementById("dots_icon_button");
    var glyphsFeatures = document.getElementById("glyphs_icon_button");

    // A recursive helper function for performing some setup by walking through all nodes
    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish edgeLength
    visit(treeData, function (d) {
        totalNodes++;
    }, function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    var currentX = initialX;
    var currentY = initialY;
    var currentScale = initialZoom;

    /*
    /!**
     * Define zoom and translation
     * *!/
    function zoom() {
        /!* The initial d3 events for scale and translation have initial values 1 and [x,y] = [50, 200] respectively
         * Therefore we need to take this into account and sum the difference to our initial scale and position attributes
         * defined in zoomToFit()
         * *!/

        /!*
         * NOTE: Add to the initial position values (initialX and initialY) the movement registered by d3.
         * d3.event.translate returns an array [x,y] with starting values [50, 200]
         * The values X and Y are swapped in zoomToFit() and we need to take that into account to give the new coordinates
         * *!/
        currentZoomScale = d3.event.scale

        var movement = d3.event.translate;
        var newX = initialX + (movement[1] - 200);
        var newY = initialY + (movement[0] - 50);
        currentX = newX;
        currentY = newY;

        /!*
         * NOTE:
         * If the scale is negative, we will see the graph upside-down and left-right swapped
         * If the scale is 0, we will not see the graph
         * Define the scale to be at least 0.1 and set it to the initialZoom + the difference of the listener and the d3.event initial scale
         * *!/


        var newScale = Math.max(initialZoom + (d3.event.scale - 1), 0.1)

        svgGroup.attr(
            "transform",
            "translate(" + [newY, newX] + ")scale(" + newScale + ")"
        );
        currentScale = newScale;
    }
    */

    function zoom() {
        var zoom = d3.event;
        svgGroup.attr("transform", "translate(" + zoom.translate + ")scale(" + zoom.scale + ")");
        currentScale = zoom.scale;
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior
        .zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", function () {
            currentZoomScale = d3.event.scale
            link.style("stroke-width", getEdgeStrokeWidth()); //Enlarge stroke-width on zoom out
            node.select("circle").style("stroke-width", getNodeStrokeWidth()); //Enlarge stroke-width on zoom out
            zoom();
        });

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3
        .select(container)
        .append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .attr("class", "overlay")
        .call(zoomListener);


    var svgGroup = baseSvg.append("g");

    var link = svgGroup.selectAll("path.link"),
        node = svgGroup.selectAll("g.node");


    /**
     * Center the screen to the position of the given node
     * */
    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select("g")
            .transition()
            .duration(duration)
            .attr(
                "transform",
                "translate(" + x + "," + y + ")scale(" + scale + ")"
            );
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    /**
     * Center the screen to the position of the given link
     * */
    function centerLink(link) {
        scale = zoomListener.scale();
        x = -(link.source.y0 + link.target.y0) / 2;
        y = -(link.source.x0 + link.target.x0) / 2;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select("g")
            .transition()
            .duration(duration)
            .attr(
                "transform",
                "translate(" + x + "," + y + ")scale(" + scale + ")"
            );
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function
    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    /**
     * Clicked node behaviour
     * Compute descendants information
     * Toggle children on click.
     * */
    function click(d, nodeEnter) {
        if (d3.event.defaultPrevented) return; // click suppressed

        //Compute children data (quantity and how many with each toxicity) before collapsing the node
        var descendantsData = getDescendants(d);

        d.numberOfDescendants = descendantsData.children;
        d.descendantsWithToxicity0 = descendantsData.toxicity0;
        d.descendantsWithToxicity1 = descendantsData.toxicity1;
        d.descendantsWithToxicity2 = descendantsData.toxicity2;
        d.descendantsWithToxicity3 = descendantsData.toxicity3;

        d = toggleChildren(d); //Collapse node
        update(d, false,document.querySelector("#tree-container div.my-statistic").style.visibility === "visible"); //NOTE: we are passing each sun that was collapsed
        //centerNode(d); We deactivated because is annoying when we collapse a thread to appear
    }

    /**
     /**
     * Clicked link behaviour
     * */
    function clickLink(l) {
        if (d3.event.defaultPrevented) return; // click suppressed
        //console.log("Link clicked");
        centerLink(l);
    }

    /*SECTION draw svgs from checboxes*/

    /**
     * Compute the position of an associated image to be centered on the node
     * that is a radiusPercentage smaller than it
     * */
    function positionImage(nodeRadius, radiusPercentage = imgRatio) {
        return nodeRadius * (radiusPercentage / 100.0 - 1);
    }

    /**
     * Compute the size of an associated image to be a radiusPercentage smaller than the node
     * */
    function sizeImage(nodeRadius, radiusPercentage = imgRatio) {
        return 2 * nodeRadius * (1 - radiusPercentage / 100.0);
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
        var cbShowTargets = [
            enabledTargets.indexOf("target-group"),
            enabledTargets.indexOf("target-person"),
            enabledTargets.indexOf("target-stereotype"),
        ];
        var listOpacity;
        var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [d.target_group, d.target_person, d.stereotype];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr("class", targets[i].class)
                    .attr("id", targets[i].id)
                    .attr("x", targets[i].x)
                    .attr("y", targets[i].y)
                    .attr("height", targets[i].height)
                    .attr("width", targets[i].width)
                    .attr("href", pathTargets + localPath + targets[i].fileName)
            }
        }
    }

    function drawDevtools(nodeEnter) {
        removeThisFeatures(nodeEnter);
        removeThisTargets(nodeEnter);
        var cbShowTargets = [
            enabledTargets.indexOf("elongated-tendency"),
            enabledTargets.indexOf("compact-tendency"),
            enabledTargets.indexOf("significant-nodes"),
            enabledTargets.indexOf("elongated-hierarchy"),
            enabledTargets.indexOf("compact-hierarchy"),
            enabledTargets.indexOf("nComp-hierarchy"),
            enabledTargets.indexOf("hybrid-hierarchy")
        ];

        var listOpacity;
        var targets = [
            objTargetGroup,
            objTargetPerson,
            objTargetStereotype,
            objFeatConstructiveness,
            objFeatArgumentation,
            objFeatSarcasm,
            objFeatMockery
        ];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter
                    .append("rect")
                    .attr("class", targets[i].class)
                    .attr("id", targets[i].id)
                    .attr("x", targets[i].x)
                    .attr("y", targets[i].y)
                    .attr("height", targets[i].height)
                    .attr("width", targets[i].width)
                    .attr("fill", colorDevtools[i])
                    .style("stroke", "black")
                    .style("stroke-width", getNodeStrokeWidth())
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;
                        //let l = getLevelRange(d);
                        let l = L;
                        let t = d_lvl;
                        let h = getHierarchy(d, l, GFcomp, t);
                        listOpacity = [0, 0, 0, 0, 0 , 0, 0];
                        if (elongatedTendency(d, l)) { listOpacity[0] = 1; }
                        if (compactTendency(d, l, GFcomp)) { listOpacity[1] = 1;}
                        if (checkSignificant(d, tol)) { listOpacity[2] = 1; }
                        switch (h) {
                            case 1:
                                listOpacity[3] = 1;
                                break;
                            case 2:
                                listOpacity[4] = 1;
                                break;
                            case 3:
                                listOpacity[5] = 1;
                                break;
                            case 4:
                                listOpacity[6] = 1;
                                break;
                        }
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
    function drawTargetsOutside(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [
            enabledTargets.indexOf("target-group"),
            enabledTargets.indexOf("target-person"),
            enabledTargets.indexOf("target-stereotype"),
        ];
        var listOpacity;
        var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter
                    .append("image")
                    .attr("class", targets[i].class)
                    .attr("id", targets[i].id)
                    .attr("x", function (d) {
                        return targets[i].x - d.radius;
                    })
                    .attr("y", targets[i].y)
                    .attr("height", targets[i].height)
                    .attr("width", targets[i].width)
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;
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
     *
     * Draw in a triangle Group --- Stereotype
     *                          \ /
     *                         Person
     * */
    function drawTargetsInside(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [
            enabledTargets.indexOf("target-group"),
            enabledTargets.indexOf("target-person"),
            enabledTargets.indexOf("target-stereotype"),
        ];
        var listOpacity;
        var targets = [
            objTargetGroupInside,
            objTargetPersonInside,
            objTargetStereotypeInside,
        ];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter
                    .append("image")
                    .attr("class", targets[i].class)
                    .attr("id", targets[i].id)
                    .attr("x", function (d) {
                        return d.radius * targets[i].x;
                    })
                    .attr("y", function (d) {
                        return d.radius * targets[i].y;
                    })
                    .attr("height", function (d) {
                        return sizeImage(d.radius) / 2.0;
                    })
                    .attr("width", function (d) {
                        return sizeImage(d.radius) / 2.0;
                    })
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;
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
     * The css values are from the target objects that are rings
     * */
    function drawTargetRings(nodeEnter, localPath) {
        removeThisTargets(nodeEnter);
        var cbShowTargets = [
            1,
            enabledTargets.indexOf("target-group"),
            enabledTargets.indexOf("target-person"),
            enabledTargets.indexOf("target-stereotype"),
        ]; //Note: we will always display the gray ring
        var listOpacity;
        var targets = [
            objTargetGrayRing,
            objTargetGroupRing,
            objTargetPersonRing,
            objTargetStereotypeRing,
        ];

        for (var i = 0; i < targets.length; i++) {
            if (cbShowTargets[i] > -1) {
                nodeEnter
                    .append("image")
                    .attr("class", targets[i].class)
                    .attr("id", targets[i].id)
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
                    .attr("href", pathTargets + localPath + targets[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;
                        listOpacity = [
                            0.5,
                            d.target_group,
                            d.target_person,
                            d.stereotype,
                        ]; //Note: the opacity of the gray ring
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
        if (drawingAllInOne) selectFeatureVisualization(nodeEnter);
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
                    drawTargets(nodeEnter, "newOption1/");
                    break;
                case "directory-2":
                    drawTargets(nodeEnter, "newOption2/");
                    break;
                //draw as ring outside of the node
                case "ring-on-node":
                    drawTargetRings(nodeEnter, "rings/");
                    break;
                //draw as an icon if 1, as rings if more options checked
                case "one-icon-or-rings":
                    enabledTargets.length > 1 ?
                        drawTargetRings(nodeEnter, "rings/") :
                        drawTargets(nodeEnter, "icons/");
                    break;

                default:
                    //console.log("default option", option);
                    break;
            }
        }
    }

    function drawTargetGroup(nodeEnter) {
        nodeEnter
            .append("image")
            .attr("class", "targetGroup")
            .attr("id", "targetGroup")
            .attr("x", targetIconGroupX) //NOTE: it is always displayed at the left side!!
            .attr("y", targetIconY)
            .attr("height", targetIconHeight)
            .attr("width", targetIconWidth)
            .attr("href", "./icons/TargetGroup2.png")
            .attr("opacity", function (d) {
                if (d.target_group) return 1;
                return 0; //We need to set the opacity or it will always be displayed!
            });
    }

    function drawTargetPerson(nodeEnter) {
        nodeEnter
            .append("image")
            .attr("class", "targetPerson")
            .attr("id", "targetPerson")
            .attr("x", targetIconPersonX) //NOTE: it is always displayed at the left side!!
            .attr("y", targetIconY)
            .attr("height", targetIconHeight)
            .attr("width", targetIconWidth)
            .attr("href", "./icons/TargetPerson3.png")
            .attr("opacity", function (d) {
                if (d.target_person) return 1;
                return 0;
            });
    }

    function drawTargeStereotype(nodeEnter) {
        nodeEnter
            .append("image")
            .attr("class", "targetStereotype")
            .attr("id", "targetStereotype")
            .attr("x", targetIconStereotypeX) //NOTE: it is always displayed at the left side!!
            .attr("y", targetIconY)
            .attr("height", targetIconHeight)
            .attr("width", targetIconWidth)
            .attr("href", "./icons/TargetStereotype.png")
            .attr("opacity", function (d) {
                if (d.stereotype) return 1;
                return 0;
            });
    }

    function visualiseTargets(nodeEnter) {
        enabledTargets.indexOf("target-group") > -1 ?
            drawTargetGroup(nodeEnter) :
            d3.selectAll("#targetGroup").remove();
        enabledTargets.indexOf("target-person") > -1 ?
            drawTargetPerson(nodeEnter) :
            d3.selectAll("#targetPerson").remove();
        enabledTargets.indexOf("target-stereotype") > -1 ?
            drawTargeStereotype(nodeEnter) :
            d3.selectAll("#targetStereotype").remove();
    }

    function removeTargets() {
        d3.selectAll("#targetGroup").remove();
        d3.selectAll("#targetPerson").remove();
        d3.selectAll("#targetStereotype").remove();
        d3.selectAll("#targetGray").remove();
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

    //Feature section
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

    function checkUncheckAll() {
        checkboxes.forEach((cb) => (cb.checked = !cb.checked));
    }

    /**
     * Delete the features of the node
     * Redraw the features of the node
     *
     * Deleting the features first helps us when the selected dropdown menu option changes
     * */
    function drawFeatureDots(nodeEnter) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        var cbFeatureEnabled = [
            enabledFeatures.indexOf("argumentation"),
            enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"),
            enabledFeatures.indexOf("mockery"),
            enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"),
            enabledFeatures.indexOf("insult"),
            enabledFeatures.indexOf("aggressiveness"),
        ];

        var features = [
            objFeatArgumentation,
            objFeatConstructiveness,
            objFeatSarcasm,
            objFeatMockery,
            objFeatIntolerance,
            objFeatImproper,
            objFeatInsult,
            objFeatAggressiveness,
        ];
        var listOpacity;

        for (var i = 0; i < 8; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [
                            d.argumentation,
                            d.constructiveness,
                            d.sarcasm,
                            d.mockery,
                            d.intolerance,
                            d.improper_language,
                            d.insult,
                            d.aggressiveness,
                        ];
                        return listOpacity[i];
                    }
                }).append("circle")
                    .attr("class", features[i].class)
                    .attr("id", features[i].id)
                    .attr("r", "10.5")
                    .attr("transform", function (d) {
                        return (
                            "translate(" +
                            (d.radius + (i + 1) * (10.5 * 2)) +
                            "," +
                            0 +
                            ")"
                        );
                    })
                    .attr("fill", colorFeature[i])
                    .style("stroke", "black")
                    .style("stroke-width", getNodeStrokeWidth())
            }
        }
    }

    function drawFeatureAsCheeseOutside(nodeEnter, localPath) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        //Add the gray cheese
        nodeEnter
            .append("image")
            .attr("class", objFeatGray.class)
            .attr("id", objFeatGray.id)
            .attr("x", objFeatGray.x) //NOTE: it is always displayed at the left side!!
            .attr("y", objFeatGray.y)
            .attr("height", objFeatGray.height)
            .attr("width", objFeatGray.width)
            .attr("href", pathFeatures + localPath + objFeatGray.fileName)
            .attr("opacity", function (d) {
                if (d.parent === undefined) return 0;
                return 0.5;
            });

        var cbFeatureEnabled = [
            enabledFeatures.indexOf("argumentation"),
            enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"),
            enabledFeatures.indexOf("mockery"),
            enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"),
            enabledFeatures.indexOf("insult"),
            enabledFeatures.indexOf("aggressiveness"),
        ];

        var features = [
            objFeatArgumentation,
            objFeatConstructiveness,
            objFeatSarcasm,
            objFeatMockery,
            objFeatIntolerance,
            objFeatImproper,
            objFeatInsult,
            objFeatAggressiveness,
        ];
        var listOpacity;

        for (var i = 0; i < features.length; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter
                    .append("image")
                    .attr("class", features[i].class)
                    .attr("id", features[i].id)
                    .attr("x", features[i].x)
                    .attr("y", features[i].y)
                    .attr("height", features[i].height)
                    .attr("width", features[i].width)
                    .attr("href", pathFeatures + localPath + features[i].fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;
                        listOpacity = [
                            d.argumentation,
                            d.constructiveness,
                            d.sarcasm,
                            d.mockery,
                            d.intolerance,
                            d.improper_language,
                            d.insult,
                            d.aggressiveness,
                        ];
                        return listOpacity[i];
                    });
            }
        }
    }

    function drawFeatureAsCheeseInside(nodeEnter, localPath) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        //Add the gray cheese
        nodeEnter.filter(function (d) {
                    return d.parent !== null;
                }).append("image")
            .attr("class", objFeatGray.class)
            .attr("id", objFeatGray.id)
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
                return 0.5;
            });

        var cbFeatureEnabled = [
            enabledFeatures.indexOf("argumentation"),
            enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"),
            enabledFeatures.indexOf("mockery"),
            enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"),
            enabledFeatures.indexOf("insult"),
            enabledFeatures.indexOf("aggressiveness"),
        ];

        var features = [
            objFeatArgumentation,
            objFeatConstructiveness,
            objFeatSarcasm,
            objFeatMockery,
            objFeatIntolerance,
            objFeatImproper,
            objFeatInsult,
            objFeatAggressiveness,
        ];
        var listOpacity;

        for (var i = 0; i < features.length; i++) {
            if (cbFeatureEnabled[i] > -1) {
                nodeEnter.filter(function (d) {
                    if (d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [
                            d.argumentation,
                            d.constructiveness,
                            d.sarcasm,
                            d.mockery,
                            d.intolerance,
                            d.improper_language,
                            d.insult,
                            d.aggressiveness,
                        ];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr("class", features[i].class)
                    .attr("id", features[i].id)
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

        var allObjectsInNode = [
            objToxicity0,
            objToxicity1,
            objToxicity2,
            objToxicity3,
            objFeatArgumentation,
            objFeatConstructiveness,
            objFeatSarcasm,
            objFeatMockery,
            objFeatIntolerance,
            objFeatImproper,
            objFeatInsult,
            objFeatAggressiveness,
            objTargetGroup,
            objTargetPerson,
            objTargetStereotype,
        ];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [
            1,
            1,
            1,
            1,
            enabledFeatures.indexOf("argumentation"),
            enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"),
            enabledFeatures.indexOf("mockery"),
            enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"),
            enabledFeatures.indexOf("insult"),
            enabledFeatures.indexOf("aggressiveness"),
            enabledTargets.indexOf("target-group"),
            enabledTargets.indexOf("target-person"),
            enabledTargets.indexOf("target-stereotype"),
        ];

        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) {
                //If the checkbox is checked, display it if it has the property
                nodeEnter
                    .append("image")
                    .attr("class", allObjectsInNode[i].class)
                    .attr("id", allObjectsInNode[i].id)
                    .attr("x", localPosition)
                    .attr("y", -10)
                    .attr("height", 20)
                    .attr("width", 20)
                    .attr(
                        "href",
                        pathFeatures + localPath + allObjectsInNode[i].fileName
                    )
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;

                        listOpacity = [
                            d.toxicity_level === 0 ? 1 : 0,
                            d.toxicity_level === 1 ? 1 : 0,
                            d.toxicity_level === 2 ? 1 : 0,
                            d.toxicity_level === 3 ? 1 : 0,
                            d.argumentation,
                            d.constructiveness,
                            d.sarcasm,
                            d.mockery,
                            d.intolerance,
                            d.improper_language,
                            d.insult,
                            d.aggressiveness,
                            d.target_group,
                            d.target_person,
                            d.stereotype,
                        ];

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
    function drawFeatureAsCircularGlyph(
        nodeEnter,
        localPath,
        localPosition
    ) {
        removeThisFeatures(nodeEnter);
        //removeThisTargets(nodeEnter);
        removeToxicities(nodeEnter);

        var allObjectsInNode = [
            objFeatGray,
            objFeatArgumentation,
            objFeatConstructiveness,
            objFeatSarcasm,
            objFeatMockery,
            objFeatIntolerance,
            objFeatImproper,
            objFeatInsult,
            objFeatAggressiveness,
            objToxicity0,
            objToxicity1,
            objToxicity2,
            objToxicity3,
            //objTargetGroup,
            //objTargetPerson,
            //objTargetStereotype,
        ];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [
            1,
            enabledFeatures.indexOf("argumentation"),
            enabledFeatures.indexOf("constructiveness"),
            enabledFeatures.indexOf("sarcasm"),
            enabledFeatures.indexOf("mockery"),
            enabledFeatures.indexOf("intolerance"),
            enabledFeatures.indexOf("improper_language"),
            enabledFeatures.indexOf("insult"),
            enabledFeatures.indexOf("aggressiveness"),
            1,
            1,
            1,
            1,
            enabledTargets.indexOf("target-group"),
            enabledTargets.indexOf("target-person"),
            enabledTargets.indexOf("target-stereotype"),
        ];

        for (var i = 0; i < allObjectsInNode.length; i++) {
            if (cbShowTargets[i] > -1) {
                //If the checkbox is checked, display it if it has the property
                nodeEnter.filter(function (d) {
                    if (d.parent === undefined) {
                        return false;
                    } else {
                        listOpacity = [
                            1,
                            d.argumentation,
                            d.constructiveness,
                            d.sarcasm,
                            d.mockery,
                            d.intolerance,
                            d.improper_language,
                            d.insult,
                            d.aggressiveness,
                            d.toxicity_level === 0 ? 1 : 0,
                            d.toxicity_level === 1 ? 1 : 0,
                            d.toxicity_level === 2 ? 1 : 0,
                            d.toxicity_level === 3 ? 1 : 0,
                            d.target_group,
                            d.target_person,
                            d.stereotype,
                        ];
                        return listOpacity[i];
                    }
                }).append("image")
                    .attr("class", allObjectsInNode[i].class)
                    .attr("id", allObjectsInNode[i].id)
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
                    .style("stroke-width", getNodeStrokeWidth())
                    .attr(
                        "href",
                        pathFeatures + localPath + allObjectsInNode[i].fileName
                    )
            }
        }
    }

    function removeToxicities(nodeEnter) {
        nodeEnter.selectAll("#toxicity0").remove();
        nodeEnter.selectAll("#toxicity1").remove();
        nodeEnter.selectAll("#toxicity2").remove();
        nodeEnter.selectAll("#toxicity3").remove();
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

        // document.getElementById(
        //     "feature-over-node-or-outside"
        // ).style.display = "none"; //Hide the dropdown menu
        drawingAllInOne = false;
        var localPosition;
        // cbFeatureInside.checked ?
        //     (localPosition = -10) :
        //     (localPosition = 30);
        switch (option) {
            case "dots":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureDots(nodeEnter); //Always drawn on the right side
                break;
            case "trivial-cheese-on-node":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureAsCheeseInside(nodeEnter, "trivialCheese/"); //Always drawn on the right side
                break;
            case "trivial-cheese-outside-node":
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureAsCheeseOutside(nodeEnter, "trivialCheese/"); //Always drawn on the right side
                break;

            case "directory-1": //"All for one and one for all" we will draw the features inside of the circle, the targets outside will be hidden and the level of toxicity in blue
                drawingAllInOne = false;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById(
                //     "feature-over-node-or-outside"
                // ).style.display = "block"; //Show the dropdown menu
                selectTargetVisualization(nodeEnter); //draw the targets if necessary

                drawFeatureAsGlyph(nodeEnter, "Bubble/", localPosition);
                break;
            case "directory-2":
                drawingAllInOne = false;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById(
                //     "feature-over-node-or-outside"
                // ).style.display = "block"; //Show the dropdown menu
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureAsCircularGlyph(nodeEnter, "NewCircular/", localPosition);
                break;

            case "new-circular":
                drawingAllInOne = false;
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

            case "directory-3":
                drawingAllInOne = false;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById(
                //     "feature-over-node-or-outside"
                // ).style.display = "block"; //Show the dropdown menu
                drawFeatureAsGlyph(nodeEnter, "Rectangular/", localPosition);
                break;

            default:
                //console.log("default option", option);
                break;
        }
    }

    function drawFeaturesCheese(nodeEnter) {
        hideFeatureDots();

        nodeEnter
            .append("image")
            .attr("class", "grayCheese")
            .attr("id", "grayCheese")
            .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
            .attr("y", cheeseY)
            .attr("height", cheeseHeight)
            .attr("width", cheeseWidth)
            .attr("href", "./featuresCheese/Gimp/grayCheese.png")
            .attr("opacity", 0.5);

        // Argumentation
        if (enabledFeatures.indexOf("argumentation") > -1) {
            nodeEnter
                .append("image")
                .attr("class", "cheeseArgumentation")
                .attr("id", "cheeseArgumentation")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Argumentation.png")
                .attr("opacity", function (d) {
                    if (d.argumentation) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeatures.indexOf("constructiveness") > -1) {
            // Constructiveness
            nodeEnter
                .append("image")
                .attr("class", "cheeseConstructiveness")
                .attr("id", "cheeseConstructiveness")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Constructiveness.png")
                .attr("opacity", function (d) {
                    if (d.constructiveness) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }

        if (enabledFeatures.indexOf("sarcasm") > -1) {
            // Sarcasm
            nodeEnter
                .append("image")
                .attr("class", "cheeseSarcasm")
                .attr("id", "cheeseSarcasm")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Sarcasm.png")
                .attr("opacity", function (d) {
                    if (d.sarcasm) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeatures.indexOf("mockery") > -1) {
            // Mockery
            nodeEnter
                .append("image")
                .attr("class", "cheeseMockery")
                .attr("id", "cheeseMockery")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Mockery.png")
                .attr("opacity", function (d) {
                    if (d.mockery) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeatures.indexOf("intolerance") > -1) {
            // Intolerance
            nodeEnter
                .append("image")
                .attr("class", "cheeseIntolerance")
                .attr("id", "cheeseIntolerance")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Intolerance.png")
                .attr("opacity", function (d) {
                    if (d.intolerance) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }

        if (enabledFeatures.indexOf("improper_language") > -1) {
            // Improper Language
            nodeEnter
                .append("image")
                .attr("class", "cheeseImproper")
                .attr("id", "cheeseImproper")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Improper.png")
                .attr("opacity", function (d) {
                    if (d.improper_language) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeatures.indexOf("insult") > -1) {
            // Insult
            nodeEnter
                .append("image")
                .attr("class", "cheeseInsult")
                .attr("id", "cheeseInsult")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Insult.png")
                .attr("opacity", function (d) {
                    if (d.insult) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeatures.indexOf("aggressiveness") > -1) {
            // Aggressiveness
            nodeEnter
                .append("image")
                .attr("class", "cheeseAggressiveness")
                .attr("id", "cheeseAggressiveness")
                .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseY)
                .attr("height", cheeseHeight)
                .attr("width", cheeseWidth)
                .attr("href", "./featuresCheese/Gimp/Aggressiveness.png")
                .attr("opacity", function (d) {
                    if (d.aggressiveness) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
    }

    function drawFeatures(nodeEnter) {
        hideCheese();
        // Argumentation
        if (enabledFeatures.indexOf("argumentation") > -1) {
            nodeEnter
                .append("circle")
                .attr("class", "featureArgumentation")
                .attr("id", "featureArgumentation")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 35 + "," + 0 + ")")
                .attr("fill", colorFeature[0])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.argumentation) return 1; //If node contains argumentation
                    return 0; //We hide it if it has no argumentation
                });
        }

        if (enabledFeatures.indexOf("constructiveness") > -1) {
            // Constructiveness
            nodeEnter
                .append("circle")
                .attr("class", "featureConstructiveness")
                .attr("id", "featureConstructiveness")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 45 + "," + 0 + ")")
                .attr("fill", colorFeature[1])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.constructiveness) return 1;
                    return 0;
                });
        }
        if (enabledFeatures.indexOf("sarcasm") > -1) {
            // Sarcasm
            nodeEnter
                .append("circle")
                .attr("class", "featureSarcasm")
                .attr("id", "featureSarcasm")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 55 + "," + 0 + ")")
                .attr("fill", colorFeature[2])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.sarcasm) return 1;
                    return 0;
                });
        }
        if (enabledFeatures.indexOf("mockery") > -1) {
            // Mockery
            nodeEnter
                .append("circle")
                .attr("class", "featureMockery")
                .attr("id", "featureMockery")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 65 + "," + 0 + ")")
                .attr("fill", colorFeature[3])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.mockery) return 1;
                    return 0;
                });
        }
        if (enabledFeatures.indexOf("intolerance") > -1) {
            // Intolerance
            nodeEnter
                .append("circle")
                .attr("class", "featureIntolerance")
                .attr("id", "featureIntolerance")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 75 + "," + 0 + ")")
                .attr("fill", colorFeature[4])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.intolerance) return 1;
                    return 0;
                });
        }

        if (enabledFeatures.indexOf("improper_language") > -1) {
            // Improper Language
            nodeEnter
                .append("circle")
                .attr("class", "featureImproperLanguage")
                .attr("id", "featureImproperLanguage")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 95 + "," + 0 + ")")
                .attr("fill", colorFeature[5])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.improper_language) return 1;
                    return 0;
                });
        }

        if (enabledFeatures.indexOf("insult") > -1) {
            // Insult
            nodeEnter
                .append("circle")
                .attr("class", "featureInsult")
                .attr("id", "featureInsult")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 105 + "," + 0 + ")")
                .attr("fill", colorFeature[6])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.insult) return 1;
                    return 0;
                });
        }
        if (enabledFeatures.indexOf("aggressiveness") > -1) {
            // Aggressiveness
            nodeEnter
                .append("circle")
                .attr("class", "featureAggressiveness")
                .attr("id", "featureAggressiveness")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 115 + "," + 0 + ")")
                .attr("fill", colorFeature[7])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidth())
                .attr("opacity", function (d) {
                    if (d.aggressiveness) return 1;
                    return 0;
                });
        }
    }

    function hideFeatureDots() {
        d3.selectAll("#featureArgumentation").remove();
        d3.selectAll("#featureConstructiveness").remove();
        d3.selectAll("#featureSarcasm").remove();
        d3.selectAll("#featureMockery").remove();
        d3.selectAll("#featureIntolerance").remove();
        d3.selectAll("#featureImproperLanguage").remove();
        d3.selectAll("#featureInsult").remove();
        d3.selectAll("#featureAggressiveness").remove();
    }

    function hideCheese() {
        d3.selectAll("#grayCheese").remove();
        d3.selectAll("#cheeseArgumentation").remove();
        d3.selectAll("#cheeseConstructiveness").remove();
        d3.selectAll("#cheeseSarcasm").remove();
        d3.selectAll("#cheeseMockery").remove();
        d3.selectAll("#cheeseIntolerance").remove();
        d3.selectAll("#cheeseImproper").remove();
        d3.selectAll("#cheeseInsult").remove();
        d3.selectAll("#cheeseAggressiveness").remove();
    }

    /*END SECTION*/

    /**
     * Draw an icon for the root node
     * */
    function visualiseRootIcon(node) {
        //Filter the nodes and append an icon just for the root node
        node
            .filter(function (d) {
                return d.parent === undefined;
            })
            .append("image")
            .attr("class", objRoot.class)
            .attr("id", objRoot.id)
            .attr("x", root.x - root.radius)
            .attr("y", root.y - root.radius)
            .attr("height", root.radius * 2)
            .attr("width", root.radius * 2)
            .attr("href", rootPath + objRoot.fileName)
            .attr("opacity", 1);
    }

    /*SECTION highlighting */
    function highlightByPropertyOR(node, link) {
        node.style("opacity", 0.2);
        link.style("opacity", 0.2);

        //Toxicity 0
        if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level === 0;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.toxicity_level === 0;
                })
                .style("opacity", 1);
        }

        //Toxicity 1
        if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level === 1;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.toxicity_level === 1;
                })
                .style("opacity", 1);
        }

        //Toxicity 2
        if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level === 2;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.toxicity_level === 2;
                })
                .style("opacity", 1);
        }

        //Toxicity 3
        if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level === 3;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.toxicity_level === 3;
                })
                .style("opacity", 1);
        }

        //Neutral stance CB is checked
        if (enabledHighlight.indexOf("highlight-neutral") > -1) {
            node
                .filter(function (d) {
                    return !d.positive_stance && !d.negative_stance;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return !d.target.positive_stance && !d.target.negative_stance;
                })
                .style("opacity", 1);
        }

        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-positive") > -1) {
            node
                .filter(function (d) {
                    return d.positive_stance;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.positive_stance;
                })
                .style("opacity", 1);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-negative") > -1) {
            node
                .filter(function (d) {
                    return d.negative_stance;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.negative_stance;
                })
                .style("opacity", 1);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-group") > -1) {
            node
                .filter(function (d) {
                    return d.target_group;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.target_group;
                })
                .style("opacity", 1);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-person") > -1) {
            node
                .filter(function (d) {
                    return d.target_person;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.target_person;
                })
                .style("opacity", 1);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
            node
                .filter(function (d) {
                    return d.stereotype;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.stereotype;
                })
                .style("opacity", 1);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
            node
                .filter(function (d) {
                    return d.argumentation;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.argumentation;
                })
                .style("opacity", 1);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
            node
                .filter(function (d) {
                    return d.constructiveness;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.constructiveness;
                })
                .style("opacity", 1);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
            node
                .filter(function (d) {
                    return d.sarcasm;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.sarcasm;
                })
                .style("opacity", 1);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-mockery") > -1) {
            node
                .filter(function (d) {
                    return d.mockery;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.mockery;
                })
                .style("opacity", 1);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
            node
                .filter(function (d) {
                    return d.intolerance;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.intolerance;
                })
                .style("opacity", 1);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
            node
                .filter(function (d) {
                    return d.improper_language;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.improper_language;
                })
                .style("opacity", 1);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-insult") > -1) {
            node
                .filter(function (d) {
                    return d.insult;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.insult;
                })
                .style("opacity", 1);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
            node
                .filter(function (d) {
                    return d.aggressiveness;
                })
                .style("opacity", 1);

            link
                .filter(function (d) {
                    return d.target.aggressiveness;
                })
                .style("opacity", 1);
        }
    }

    function highlightByPropertyAND(node, link) {
        node.style("opacity", 1);
        link.style("opacity", 1);

        //Toxicity not 0
        if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 0;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 0;
                })
                .style("opacity", opacityValue);
        }

        //Toxicity not 1
        if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 1;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 1;
                })
                .style("opacity", opacityValue);
        }

        //Toxicity not 2
        if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 2;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 2;
                })
                .style("opacity", opacityValue);
        }

        //Toxicity not 3
        if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 3;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 3;
                })
                .style("opacity", opacityValue);
        }

        //Neutral stance CB is checked
        if (enabledHighlight.indexOf("highlight-neutral") > -1) {
            node
                .filter(function (d) {
                    return d.positive_stance || d.negative_stance;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return d.target.positive_stance || d.target.negative_stance;
                })
                .style("opacity", opacityValue);
        }

        //Positive stance CB is checked
        if (enabledHighlight.indexOf("highlight-positive") > -1) {
            node
                .filter(function (d) {
                    return !d.positive_stance;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.positive_stance;
                })
                .style("opacity", opacityValue);
        }

        //Negative stance CB is checked
        if (enabledHighlight.indexOf("highlight-negative") > -1) {
            node
                .filter(function (d) {
                    return !d.negative_stance;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.negative_stance;
                })
                .style("opacity", opacityValue);
        }

        //Target group CB is checked
        if (enabledHighlight.indexOf("highlight-group") > -1) {
            node
                .filter(function (d) {
                    return !d.target_group;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.target_group;
                })
                .style("opacity", opacityValue);
        }

        //Target person CB is checked
        if (enabledHighlight.indexOf("highlight-person") > -1) {
            node
                .filter(function (d) {
                    return !d.target_person;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.target_person;
                })
                .style("opacity", opacityValue);
        }

        //Stereotype CB is checked
        if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
            node
                .filter(function (d) {
                    return !d.stereotype;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.stereotype;
                })
                .style("opacity", opacityValue);
        }

        //Argumentation CB is checked
        if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
            node
                .filter(function (d) {
                    return !d.argumentation;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.argumentation;
                })
                .style("opacity", opacityValue);
        }

        //Constructiveness CB is checked
        if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
            node
                .filter(function (d) {
                    return !d.constructiveness;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.constructiveness;
                })
                .style("opacity", opacityValue);
        }

        //Sarcasm CB is checked
        if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
            node
                .filter(function (d) {
                    return !d.sarcasm;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.sarcasm;
                })
                .style("opacity", opacityValue);
        }

        //Mockery CB is checked
        if (enabledHighlight.indexOf("highlight-mockery") > -1) {
            node
                .filter(function (d) {
                    return !d.mockery;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.mockery;
                })
                .style("opacity", opacityValue);
        }
        //Intolerance CB is checked
        if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
            node
                .filter(function (d) {
                    return !d.intolerance;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.intolerance;
                })
                .style("opacity", opacityValue);
        }
        //Improper language CB is checked
        if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
            node
                .filter(function (d) {
                    return !d.improper_language;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.improper_language;
                })
                .style("opacity", opacityValue);
        }

        //Insult language CB is checked
        if (enabledHighlight.indexOf("highlight-insult") > -1) {
            node
                .filter(function (d) {
                    return !d.insult;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.insult;
                })
                .style("opacity", opacityValue);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
            node
                .filter(function (d) {
                    return !d.aggressiveness;
                })
                .style("opacity", opacityValue);

            link
                .filter(function (d) {
                    return !d.target.aggressiveness;
                })
                .style("opacity", opacityValue);
        }
    }

    function highlightNodesByPropertyOR(node, link) {
        if (enabledHighlight.length === 0) {
            //If no tag (toxicity, stance,...) checkbox is selected: highlight all
            nodes.forEach(function (d) {
                d.highlighted = 1;
            });
            node.style("opacity", 1);
        } else {
            //If some tag checkbox is selected behave as expected
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
                return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
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
                return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
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
            return (levelsIndexes.includes(d.depth));
        }).style("opacity", 1);

        //Highlight only the edges whose both endpoints are highlighted
        link.style("opacity", function (d) {
            return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
        });
    }

    /*END section */

    function writeIdLabel(nodeEnter) {
        nodeEnter
            .append("text")
            .attr("x", 25)
            .attr("dy", ".35em")
            .attr("class", "nodeText")
            .attr("id", "nodeText")
            .attr("text-anchor", "end")
            .text(function (d) {
                return d.name;
            })
            .style("opacity", 1);
    }

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
                toxicity3: 0,
            };
        }
        var total = 0,
            childrenList = [],
            totalToxic0 = 0,
            totalToxic1 = 0,
            totalToxic2 = 0,
            totalToxic3 = 0;

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
            });
        }

        return {
            children: total,
            toxicityLevel: node.toxicity_level,
            toxicity0: totalToxic0,
            toxicity1: totalToxic1,
            toxicity2: totalToxic2,
            toxicity3: totalToxic3,
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
                targNone: 0,
            };
        }
        var total = 0,
            childrenList = [],
            totalToxic0 = 0,
            totalToxic1 = 0,
            totalToxic2 = 0,
            totalToxic3 = 0,
            totalTargGroup = 0,
            totalTargPerson = 0,
            totalTargStereotype = 0,
            totalTargNone = 0;

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
                childrenList.targGroup && d.highlighted ?
                    (totalTargGroup += childrenList.totalTargGroup + 1) :
                    (totalTargGroup += childrenList.totalTargGroup);
                childrenList.targPerson && d.highlighted ?
                    (totalTargPerson += childrenList.totalTargPerson + 1) :
                    (totalTargPerson += childrenList.totalTargPerson);
                childrenList.targStereotype && d.highlighted ?
                    (totalTargStereotype += childrenList.totalTargStereotype + 1) :
                    (totalTargStereotype += childrenList.totalTargStereotype);
                !childrenList.targGroup &&
                !childrenList.targPerson &&
                !childrenList.targStereotype &&
                d.highlighted ?
                    (totalTargNone += childrenList.totalTargNone + 1) :
                    (totalTargNone += childrenList.totalTargNone);
            });
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
            targNone: 0,
        };
    }



    function writeTooltipText(d) {
        //I want to show Argument and Constructiveness in one line, I add a dummy space to keep that in the loop
        var jsonValues = [
            d.name,
            d.toxicity_level,
            d.depth,
            d.argumentation,
            d.constructiveness,
            -1,
            d.sarcasm,
            d.mockery,
            d.intolerance,
            d.improper_language,
            d.insult,
            d.aggressiveness,
            d.target_group,
            d.target_person,
            d.stereotype,
        ];
        var jsonNames = [
            "Comment ID",
            "Toxicity level",
            "Comment depth",
            "Argument",
            "Constructiveness",
            " ",
            "Sarcasm",
            "Mockery",
            "Intolerance",
            "Improper language",
            "Insult",
            "Aggressiveness",
            "Target group",
            "Target person",
            "Stereotype",
        ];
        var i = 0;
        tooltipText = "<table>";

        for (i = 0; i < jsonValues.length; i++) {
            if (i === 3 || i === 12) tooltipText += "<tr><td></td></tr>"; // I want a break between the first line and the features and the targets
            if (i % 3 === 0) tooltipText += "<tr>"; //Start table line
            if (i < 3)
                tooltipText +=
                    "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>";
            //First ones without bold
            else if (jsonValues[i] !== -1)
                jsonValues[i] ?
                    (tooltipText +=
                        "<td><b>" +
                        jsonNames[i] +
                        ": " +
                        jsonValues[i] +
                        "</b></td>") :
                    (tooltipText +=
                        "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>");
            if ((i + 1) % 3 === 0) tooltipText += "</tr>"; //End table line
        }
        //Write growingFactor of node
        tooltipText += "</table>";
        //var s = getLevelRange(d);
        var s = L;
        console.log("L: " + s);
        tooltipText += "<br> <table><tr><td> Growing Factor: " + getGrowFactor(d,s) + "</td></tr></table>";
        //Calculate tendencies and hierarchy of nodes
        tooltipText += "<br> <table>" +
            "<tr>" +
                "<td> ET: " + elongatedTendency(d, s) + "</td>" +
                "<td> CT: " + compactTendency(d, s, GFcomp) + "</td>" +
            "</tr></table>"
        tooltipText += "<br> <table>";

        //If node is collapsed, we also want to add some information about its sons
        if (d._children) {
            var sonTitles = [
                "Direct comments",
                "Total number of generated comments",
                "Not toxic",
                "Mildly toxic",
                "Toxic",
                "Very toxic",
            ];
            var sonValues = [
                d._children.length,
                d.numberOfDescendants,
                d.descendantsWithToxicity0,
                d.descendantsWithToxicity1,
                d.descendantsWithToxicity2,
                d.descendantsWithToxicity3,
            ];

            for (i = 0; i < sonValues.length; i++) {
                if (i % 2 === 0) tooltipText += "<tr>"; //Start table line
                tooltipText +=
                    "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
            }
        }
        tooltipText += "</table>";
        tooltipText += "<br>" + d.coment;


    }

    //if d == root do somethihg
    // else if d == highlighted nodes
    // if rootnodeText write another fuction, tooltip style for this condition as well
   // var rootToolTip = writeTooltipRoot(d);
   //  var totalNumberOfNodesRoot = rootToolTip.children;
   //
   //  var totalNotToxicRoot = rootToolTip.toxicity0,
   //      totalMildlyToxicRoot = rootToolTip.toxicity1,
   //      totalToxicRoot = rootToolTip.toxicity2,
   //      totalVeryToxicRoot = rootToolTip.toxicity3;

    function writeTooltipRoot(d) {

        var sonTitles = [
            "Direct comments",
            "Total number of generated comments",
            "Not toxic",
            "Mildly toxic",
            "Toxic",
            "Very toxic",
        ];
        var sonValues = [
            d.children ? d.children.length : null,
            totalNumberOfNodes,
            totalNotToxic,
            totalMildlyToxic,
            totalToxic,
            totalVeryToxic,
        ];
        var hierarchyList = [
            "Unspecified",
            "Elongated",
            "Compact",
            "nCompact",
            "Hybrid",
        ];
        tooltipText = "<table>";
        tooltipText += "<br> <table>";

        for (i = 0; i < sonValues.length; i++) {
            if (i % 2 === 0) tooltipText += "<tr>"; //Start table line
            tooltipText +=
                "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
            if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
        }

        //Write growingFactor of root
        tooltipText += "</table>";
        //var s = getLevelRange(d);
        var s = L;
        tooltipText += "<br> <table><tr><td> Growing Factor: " + getGrowFactor(d,s) + "</td></tr>";
        //Calculate tendencies and hierarchy of nodes
        tooltipText +=
            "<tr>" +
                "<td> ET: " + elongatedTendency(d, s) +
                " CT: " + compactTendency(d, s, GFcomp) + "</td>" +
            "</tr>"
        //Calculate hierarchy
        var t = d_lvl;
        var h = getHierarchy(d, s, GFcomp, t);
        tooltipText +=
            "<tr>" +
                "<td> Hierarchy: " + hierarchyList[h] + "</td>" +
            "</tr></table>"
        tooltipText += "<br> <table>";
    }


    function update(source, first_call, static_values_checked_param = true) {
        tree = tree
            .nodeSize([separationHeight, 0]) //heigth and width of the rectangles that define the node space
            .separation(function (a, b) {
                //Compute the radius of the node for the first visualization of the graph
                if (a.radius === undefined) a.radius = computeNodeRadius(a);
                if (b.radius === undefined) b.radius = computeNodeRadius(b);

                return Math.ceil((a.radius + b.radius) / separationHeight) + 0.5;
            });

        // Compute the new tree layout.
        nodes = tree.nodes(root).reverse();
        //nodes = tree.nodes(root);
        var links = tree.links(nodes);

        // Set widths between levels based on edgeLength.
        nodes.forEach(function (d) {
            d.y = d.depth * edgeLength;
        });

        // Update the nodes…
        var node = svgGroup.selectAll("g.node").data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node
            .enter()
            .append("g")
            .filter(function (d) {
                return d;
            })
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", function (d) {
                click(d, nodeEnter);
                if (!d3.event.defaultPrevented) {
                    if (document.querySelector("#tree-container div.my-statistic").style.visibility === "visible") {
                        statisticBackground.html(writeStatisticText());
                    }
                }
            })
            .on("mouseover", function (d) {
                var highlighted_nodes = node.filter(function (n) {
                    return n.highlighted;
                })[0].map(i => i.__data__.name); // don't ask..
                if (d !== root && highlighted_nodes.includes(d.name)) {
                    writeTooltipText(d);
                    tooltip.style("visibility", "visible").html(tooltipText);
                }
                else if(d == root){
                    writeTooltipRoot(d);
                    tooltip.style("visibility", "visible").html(tooltipText);
                }
            })
            .on("mousemove", function (d) {
                // if (d !== root) {
                    return tooltip.style("top", (d3.mouse(document.querySelector(".overlay"))[1] - 30) + "px").style("left", (d3.mouse(document.querySelector(".overlay"))[0] - 440) + "px");
                // }
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            });

        nodeEnter
            .append("image")
            .attr("class", "backgroundCircle")
            .attr("id", "backgroundCircle")
            .style("position", "relative")
            .style("z-index", -1)
            .style("opacity", 1);

        nodeEnter
            .append("circle")
            .attr("class", "nodeCircle")
            .attr("r", "10.5")
            .style("stroke", "black")
            .style("stroke-width", getNodeStrokeWidth());

        function featureVisualizationListener () {
                if (nodeEnter[0].length) {
                    Object.keys(nodeEnter[0]).forEach(key => {
                        if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                    });
                    nodeEnter = nodeEnter.filter(function (d) {
                        return d;
                    })
                    if (nodeEnter[0].length) {
                        selectFeatureVisualization(nodeEnter);
                    }
                }
                if (!nodeEnter[0].length) {
                    dotsFeatures.removeEventListener("click", featureVisualizationListener);
                    dotsFeatures.removeEventListener("change", featureVisualizationListener);
                    glyphsFeatures.removeEventListener("click", featureVisualizationListener);
                    glyphsFeatures.removeEventListener("change", featureVisualizationListener);
                }
        }
        if (nodeEnter[0].length) {
            dotsFeatures.addEventListener("click", featureVisualizationListener);

            glyphsFeatures.addEventListener("click", featureVisualizationListener);

            /*SECTION checkboxes listener*/

            dotsFeatures.addEventListener("change", featureVisualizationListener);

            glyphsFeatures.addEventListener("change", featureVisualizationListener);
        }

        var static_values_checked = static_values_checked_param;
        jQuery("#static_values_button").click(function () {
            if (!static_values_checked) {
                document.getElementById('static_values_button').innerHTML = '&#8722;';
                static_values_checked = true;
                statisticBackground.style("visibility", "visible").html(writeStatisticText());
                console.log('[User]', user.split('/')[2], '| [interaction]', 'show_summary', '| [Date]', Date.now());
            } else {
                document.getElementById('static_values_button').innerHTML = '&#43;'
                static_values_checked = false;
                statisticBackground.style("visibility", "hidden").html(writeStatisticText());
                console.log('[User]', user.split('/')[2], '| [interaction]', 'hide_summary', '| [Date]', Date.now());
            }
        });

        function buttonsDevtoolsClick() {
            enabledTargets =
                Array.from(checkboxesDevtools) // Convert checkboxes to an array to use filter and map.
                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

            highlightDevtoolsAND(node, link, enabledTargets);

            if (static_values_checked) {
                statisticBackground.html(writeStatisticText());
            }
            drawDevtools(nodeEnter);
        };

        //Input values for vars
        jQuery("#input-n-btn").click(function () {
            N = document.getElementById('input-n-field').value;
            console.log('[User]', user.split('/')[2], '| [interaction]', 'change_N_value_to: ' + N, '| [Date]', Date.now());
            buttonsDevtoolsClick();
        });

        jQuery("#input-l-btn").click(function () {
            L = document.getElementById('input-l-field').value;
            console.log('[User]', user.split('/')[2], '| [interaction]', 'change_L_value_to: ' + L, '| [Date]', Date.now());
            buttonsDevtoolsClick();
        });

        jQuery("#input-gfcomp-btn").click(function () {
            GFcomp = document.getElementById('input-gfcomp-field').value;
            console.log('[User]', user.split('/')[2], '| [interaction]', 'change_GFc_value_to: ' + GFcomp, '| [Date]', Date.now());
            buttonsDevtoolsClick();
        });

        jQuery("#input-d-btn").click(function () {
            d_lvl = document.getElementById('input-d-field').value;
            console.log('[User]', user.split('/')[2], '| [interaction]', 'change_d_value_to: ' + d_lvl, '| [Date]', Date.now());
            buttonsDevtoolsClick();
        });

        jQuery("#input-gfelon-btn").click(function () {
            GFelon = document.getElementById('input-gfelon-field').value;
            console.log('[User]', user.split('/')[2], '| [interaction]', 'change_GFe_value_to: ' + GFelon, '| [Date]', Date.now());
            buttonsDevtoolsClick();
        });

        jQuery("#input-tol-btn").click(function () {
            tol = document.getElementById('input-tol-field').value;
            console.log('[User]', user.split('/')[2], '| [interaction]', 'change_tol_value_to: ' + tol, '| [Date]', Date.now());
            buttonsDevtoolsClick();
        });

        function getLengthFilterByName(array, stringToMatch, matchPositive = true) {
            return Array.from(array).filter(function (val) {
                if (matchPositive) {
                    return val.includes(stringToMatch);
                } else {
                    return !val.includes(stringToMatch);
                }
            }).length;
        }

        try {
            $(document).ready(function () {

                checkboxesTargets.forEach(function (checkboxItem) {
                    enabledTargets =
                        Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                            .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                            .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                    selectTargetVisualization(nodeEnter);
                });

                checkboxes.forEach(function (checkboxItem) {
                    enabledFeatures =
                        Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                            .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                            .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                    selectFeatureVisualization(nodeEnter);
                });


                /*SECTION checkboxes listener*/

                function checkboxesTargetsListener (event) {
                    if (nodeEnter[0].length) {

                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            enabledTargets =
                                Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            }
                            selectTargetVisualization(nodeEnter);
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxesTargets.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesTargetsListener);
                        });
                    }
                }
                // Use Array.forEach to add an event listener to each checkbox.
                // Draw target images
                checkboxesTargets.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesTargetsListener)
                    }
                });

                function checkboxesListener (event) {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            enabledFeatures =
                                Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            }
                            selectFeatureVisualization(nodeEnter);
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxes.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesListener);
                        });
                    }
                }

                checkboxes.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesListener);
                    }
                });

                function checkboxesHighlightGroupORListener (event) {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
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


                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            }
                            checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
                            if (static_values_checked) {
                                statisticBackground.html(writeStatisticText());
                            }
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxesHighlightGroupOR.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesHighlightGroupORListener);
                        });
                    }
                }
                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupOR.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesHighlightGroupORListener)
                    }
                });

                function checkboxesHighlightGroupANDListener (event) {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
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


                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, " | [Date]", Date.now());
                            }
                            checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
                            if (static_values_checked) {
                                statisticBackground.html(writeStatisticText());
                            }
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxesHighlightGroupAND.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesHighlightGroupANDListener);
                        });
                    }
                }
                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupAND.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesHighlightGroupANDListener)
                    }
                });

                function checkboxesDevtoolsListener (event) {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            enabledTargets =
                                Array.from(checkboxesDevtools) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                            if (event.target.checked) {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + event.target.name + '_' + event.target.value, "| [Date]", Date.now());
                            }

                            highlightDevtoolsAND(node, link, enabledTargets);

                            if (static_values_checked) {
                                statisticBackground.html(writeStatisticText());
                            }
                            drawDevtools(nodeEnter);
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxesDevtools.forEach(function (checkboxItem) {
                            checkboxItem.removeEventListener("change", checkboxesDevtoolsListener);
                        });
                    }
                }

                // Use Array.forEach to add an event listener to each checkbox.
                // Draw target images
                checkboxesDevtools.forEach(function (checkboxItem) {
                    if (nodeEnter[0].length) {
                        checkboxItem.addEventListener('change', checkboxesDevtoolsListener)
                    }
                });

                // To notify the DOM that the ready function has finished executing.
                // This to be able to manage the filters if it is given the case that the code of the onLoad function finishes before.
                const event = new Event('codeReady');

                // Dispatch the event.
                document.querySelector("body").dispatchEvent(event);

                codeReady = true;
            });

        } catch (TypeError) {
            console.error("Error attaching buttons... trying again...");
        }

        function injectIntentConversation(textMsg){
            // Get the existing localStorage data
            var existingStorage = localStorage.getItem("chat_session");
            // If no existing data, create an array
            // Otherwise, convert the localStorage string to an array
            existingStorage = existingStorage ? JSON.parse(existingStorage) : {};

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:5005/conversations/" + existingStorage["session_id"] + "/trigger_intent?token=DataVisualizationInLinguisticsSecretToken&include_events=NONE&output_channel=socketio", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
            "name": "generate_response_message",
            "entities": {
                "response_message": textMsg
            }
            }));
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

        function checkboxANDListener () {
            if (nodeEnter[0].length) {
                Object.keys(nodeEnter[0]).forEach(key => {
                    if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                });

                nodeEnter = nodeEnter.filter(function (d) {
                    return d;
                })

                if (nodeEnter[0].length) {
                    console.log("test2")
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
                }
            }
            if (!nodeEnter[0].length) {
                checkboxAND.removeEventListener("change", checkboxANDListener);
            }
        }
        if (nodeEnter[0].length) {
            checkboxAND.addEventListener("change",checkboxANDListener);
        }

        function checkboxORListener () {
            if (nodeEnter[0].length) {
                Object.keys(nodeEnter[0]).forEach(key => {
                    if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                });

                nodeEnter = nodeEnter.filter(function (d) {
                    return d;
                })

                if (nodeEnter[0].length) {
                    console.log("test2")
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
                }
            }
            if (!nodeEnter[0].length) {
                checkboxOR.removeEventListener("change", checkboxORListener);
            }
        }
        // If OR is selected, uncheck the AND and highlight by property OR
        if (nodeEnter[0].length) {
            checkboxOR.addEventListener("change",checkboxORListener);
        }

        if (!first_call) {
            checkboxesTargets.forEach(function (checkboxItem) {
                enabledTargets =
                    Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectTargetVisualization(nodeEnter);
            });

            checkboxes.forEach(function (checkboxItem) {
                enabledFeatures =
                    Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectFeatureVisualization(nodeEnter);
            });

            checkboxesDevtools.forEach(function (checkboxItem) {
                enabledTargets =
                    Array.from(checkboxesDevtools) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectTargetVisualization(nodeEnter);
            });
        }

        //Enable checkboxes and dropdown menu + show features if they are selected
        checkboxesPropertyFeature.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute("disabled");
        });
        checkboxesPositioningFeature.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute("disabled");
        });
        checkboxes.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute("disabled");
        });
        // dropdownFeatures.removeAttribute("disabled");

        checkButtons.forEach(function (button) {
            button.removeAttribute("disabled");
        });

        if (
            !document.querySelector("input[value=dot-feat]").checked &&
            !document.querySelector("input[value=cheese-feat]").checked
        ) {
            document.querySelector("input[value=dot-feat]").checked = true;
            //drawFeatures(nodeEnter);
        } else {
            //checkboxFeatureCheese.checked ? drawFeaturesCheese(nodeEnter) : drawFeatures(nodeEnter);
            //console.log(enabledFeatures);
        }


        d3.select("#zoom_in_icon").on("click", function () {
            currentScale = Math.min(3.0, zoomListener.scale() + 0.1);

            zoomListener.scale(currentScale)
                // .translate([2200 - currentX - currentScale, 900 - currentY - currentScale])
                .event(svgGroup);
            console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_in', ' | [Date]', Date.now());
        });

        d3.select("#zoom_out_icon").on("click", function () {
            currentScale = Math.max(0.1, currentScale - 0.1);

            zoomListener.scale(currentScale)
                // .translate([2200 - currentX + currentScale, 900 - currentY + currentScale])
                .event(svgGroup);
            console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_in', ' | [Date]', Date.now());
        });

        d3.select("#zoom_reset_icon").on("click", function () {
            currentScale = 0.4;

            zoomListener.scale(currentScale)
                .translate([currentX - currentScale, currentY - currentScale])
                .event(svgGroup);
            console.log('[User]', user.split('/')[2], '| [interaction]', 'reset_zoom', ' | [Date]', Date.now());
        });

        // Use Array.forEach to add an event listener to each checkbox.


        /*END SECTION checkboxes listener*/

        /* NOTE: the nodes that get to the function update()
          are root and the ones that were collapsed
          Therefore, for this nodes that are getting uncollapsed we want to:
          - show the targets if necessary
          - show the text if necessary (not here, we do it with nodeEnter)
          - show the features if necessary
          - highlight nodes and edges
          * */
        if (!first_call) {
            selectTargetVisualization(nodeEnter);
            selectFeatureVisualization(nodeEnter);
        }

        // checkboxFeatureMenu.checked ?
        //     selectFeatureVisualization(nodeEnter) :
        //     removeAllFeatures();
        /*if(checkboxFeatureMenu.checked) checkboxFeatureCheese.checked ? drawFeaturesCheese(nodeEnter) : drawFeatures(nodeEnter);*/

        // Update the text to reflect whether node has children or not.
        node
            .select("text")
            .attr("x", 25)
            .attr("text-anchor", "end")
            .text(function (d) {
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node
            .select("circle.nodeCircle")
            //.attr("r", 4.5)
            .attr("r", function (d) {
                return computeNodeRadius(d);
            })
            .style("fill", function (d) {
                if (d._children && d._children.length === 1)
                    return colourCollapsed1Son;
                //If it is collapsed and just has one children
                else {
                    //Otherwise, colour the node according to its level of toxicity
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
                }
            });

        node
            .select("image.backgroundCircle")
            .attr("x", function (d) {
                return -d.radius;
            })
            .attr("y", function (d) {
                return -d.radius;
            })
            .attr("height", function (d) {
                return d.radius * 2;
            })
            .attr("width", function (d) {
                return d.radius * 2;
            })
            .attr("href", pr + "circle-background.png")
            .style("position", "relative")
            .style("z-index", -1);

        visualiseRootIcon(node); //Draw an icon for the root node

        // Transition nodes to their new position.
        var nodeUpdate = node
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text").style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node
            .exit()
            .transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle").attr("r", 0);

        nodeExit.select("text").style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link").data(links, function (d) {
            return d.target.id;
        });

        // Enter any new links at the parent's previous position.
        link
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0,
                };
                return diagonal({
                    source: o,
                    target: o,
                });
            })
            .style("stroke", function (d) {
                if (d.target.positive_stance && d.target.negative_stance)
                    return colourBothStances;
                //Both against and in favour
                else if (d.target.positive_stance === 1)
                    return colourPositiveStance;
                //In favour
                else if (d.target.negative_stance === 1)
                    return colourNegativeStance;
                //Against
                else return colourNeutralStance; //Neutral comment
            })
            .on("click", clickLink);

        // Transition links to their new position.
        link.transition().duration(duration).attr("d", diagonal);

        checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);

        // Transition exiting nodes to the parent's new position.
        link
            .exit()
            .transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y,
                };
                return diagonal({
                    source: o,
                    target: o,
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


    // Append a group which holds all nodes and which the zoom Listener can act upon.

    // Define the root position
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    document.querySelector("#tree-container div.my-statistic").style.visibility = "visible";
    update(root, true, true);
    centerNode(root);

    let element = document.getElementById('tree-container');
    let computedStyle = getComputedStyle(element);
    let elementWidth = element.clientWidth;   // width with padding
    elementWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    canvasWidth = elementWidth;

    var box = computeDimensions(nodes);
    var initialSight = zoomToFitGraph(box.minX, box.minY, box.maxX, box.maxY, root, canvasHeight, canvasWidth);
    initialZoom = initialSight.initialZoom;
    initialX = initialSight.initialX;
    initialY = initialSight.initialY;

    zoomListener.scale(initialZoom);
    zoomListener.translate([initialY, initialX]);
    zoomListener.event(baseSvg);

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

    var statisticText = "<span style='font-size: 23px;'> Summary of " + sel_item.split('/')[2] + "</span> <button class='btn btn-primary'>+</button>";

    // statisticBackground.style("visibility", "visible").html(statisticText);


    // statisticBackground.style("visibility", "visible").html(writeStatisticText());


    function writeStatisticText() {
        // var statisticText = "<span style='font-size: 23px;'> Summary of " + sel_item.split('/')[2] + "</span>";

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
        var targetImagesPath = ["icons/Group.svg", "icons/Person.svg", "icons/Stereotype.svg", "icons/Blank.png"];
        var toxicityLevelsPath = ["Level0.png", "Level1.png", "Level2.png", "Level3.png"];

        for (var i = 0; i < statTitlesToxicity.length; i++) {
            statisticText += "<tr style='font-size: 20px;'>"; //Start table line

            //Write toxicity and target line
            statisticText += "<td style='font-size: 20px; width: 400px; margin-right: 25px;'>" + "<img src=" + pf + toxicityLevelsPath[i] + " style='width: 35px; margin-right: 15px; margin-left: 25px;'>" + statTitlesToxicity[i].toString() + ": " + "<td style='padding-right: 55px;'>" + statValuesTox[i].toString() + "</td>";
            statisticText += "<td style='font-size: 20px; width: 400px;'>" + "<img src=" + pt + targetImagesPath[i] + " style='width: 25px; margin-right: 15px; margin-left: 25px;'>" + statTitlesTargets[i].toString() + ": " + "<td>" + statValuesTarg[i].toString() + "</td>";

            statisticText += "</tr>"; //End table line
        }

        statisticText += "</table>";
        //getTreeData(root, sel_item.split('/')[2]);

        return statisticText;
    }

    console.log('[User]', user.split('/')[2], '| [interaction]', 'Tree_layout_loaded', ' | [Date]', Date.now());

/*******************************
*   Categorization Functions   *
********************************/

    /**
     * Function that returns the number of nodes of a tree given its root node
     * @param node tree root
     * @returns {number} total number of nodes in subtree
     */
    function getNumberOfNodes(node) {
        var treeSize = 1;
        if (node.children) {
            node.children.forEach(function (d) {
                treeSize += getNumberOfNodes(d);
            });
        }
        return treeSize;
    }

    /**
     * Function that detects if a subtree originated from a node is a 'spine' structure
     * @param node initial node
     * @param level depth of subtree
     * @returns {boolean} True if it's a spine, False if not
     */
    function isSpine(node, level) {
        let numNodes = 0;
        let queue = [];
        let found = false;
        queue.push(node);

        while (queue.length > 0 && !found) {
            let n = queue.shift();
            numNodes++;
            if (numNodes > level) { found = true; } //subtree is NOT a spine
            if (n.children && (level - n.depth) >= 0) {
                n.children.forEach(d => {
                    queue.push(d);
                });
            }
        }
        //return !found;
        return (numNodes == level);
    }

    function highlightDevtoolsAND(node, link, enabledTargetsValue, opacityValue = 0.1) {

        nodes.forEach(function (d) {
            d.highlighted = 1;
        });
        node.style("opacity", 1);

        //Significant CB is checked
        if (enabledTargetsValue.indexOf("significant-nodes") > -1) {
            node.filter(function (d) {
                if (isSignificant(d, tol)) {console.log("node "+d.name+" is significant with tol "+tol);}
                if (!checkSignificant(d, tol)) d.highlighted = 0;
                return (!checkSignificant(d, tol));
            }).style("opacity", opacityValue);
        }
        //Elongated CB is checked
        if (enabledTargetsValue.indexOf("elongated-tendency") > -1) {
            node.filter(function (d) {
                if (!elongatedTendency(d, L)) d.highlighted = 0;
                return (!elongatedTendency(d, L));
            }).style("opacity", opacityValue);
        }
        //Compact CB is checked
        if (enabledTargetsValue.indexOf("compact-tendency") > -1) {
            node.filter(function (d) {
                if (!compactTendency(d, L, GFcomp)) d.highlighted = 0;
                return (!compactTendency(d, L, GFcomp));
            }).style("opacity", opacityValue);
        }

        //Highlight only the edges whose both endpoints are highlighted
        link.style("opacity", function (d) {
            return d.source.highlighted && d.target.highlighted ?
                1 :
                opacityValue;
        });
    }

    function isSignificant(node, tol) {
        if (node.parent) {
            if (node.children) {
                //let aux = (node.children.length / node.parent.children.length);
                let aux = (getNumberOfNodes(node) / getNumberOfNodes(node.parent));
                /*console.log("node "+ node.name + " at lv " + node.depth + " with " + node.children.length
                    + " childs, has significance: " + aux);*/
                return (aux >= tol);
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    function checkSignificant(node, tol) {
        if (node == root) { return true; } //ignore root case
        let nodeList = [];
        let found = false;
        let currentNode = node;
        while (!found) {
            nodeList.push(currentNode);
            if (currentNode.parent) { currentNode = currentNode.parent; }
            else { found = true; }
        }
        while ((nodeList.length > 0) && found) {
            let n = nodeList.pop();
            if (!isSignificant(n, tol)) { found = false; }
        }
        return found;
    }

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
     * Find the length of the longest chain in a hierarchy
     * @param node tree root
     * @returns {number} length going to the root to the deepest node in the data structure
     */
    function getLengthDeepestNode(node) {
        var hierarchy = d3.hierarchy(node);
        var longest = d3.max(hierarchy.descendants().map(function(d) {
          return d.depth
        }));
        // console.log("The longest chain has " + (longest) + " levels.")
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
     * function that returns the maximum width of a subtree given its root node
     * @param node tree root
     * @param height depth of tree
     * @returns {number|*} number of nodes in sublevel with max width
     */
    function getMaxWidth(node, height) {
        var nodeList = new Array(height+1).fill(0);
        if (height == 0) { return 1; }
        console.log("initList: " + nodeList);
        getNodesInLevel(node, 0, height, nodeList);
        //var aux = nodeList.reduce((a, b) => a + b, 0);
        let aux = 0;
        for (i = 0; i < nodeList.length; i++) {
            aux += nodeList[i];
        }
        let result = Math.max.apply(null, nodeList);
        return result;
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

    /**
     * Function that returns the number of leaf nodes in a tree given its root node
     * @param node tree root
     * @returns {number} number of leaves
     */
    function getNumberOfLeaves(node) {
        if (!node.children) {
            return 1; // Count leaf
        }
        var numLeaves = 0;
        if (node.children) {
            node.children.forEach(function (d) {
                numLeaves += getNumberOfLeaves(d);
            });
        }
        return numLeaves;
    }

    /**
     * function that calculates the tree's depth range to explore
     * @param node root node
     * @returns {number} desired depth level
     */
    function getLevelRange(node) {
        let level = 0;
        let exploredNodes = 0;
        let totalNodes = Math.floor((getNumberOfNodes(node) * 0.6)); //Assume 60% of tree
        let queue = [];
        queue.push(node);

        while (queue.length > 0 && exploredNodes < totalNodes) {
            let n = queue.shift();
            exploredNodes++;
            if ((n.depth - node.depth) > level) { level = n.depth - node.depth; }
            if (n.children) {
                n.children.forEach(d => {
                    queue.push(d);
                });
            }
        }
        return level;
    }

    /**
     * Function that returns the number of children of a subtree in a given level
     * @param node root of the subtree
     * @param level depth level
     * @returns {number|*} number of child nodes in level
     */
    function getChildrenInLevel(node, level) {
        if (level == 0 && node.children) {
            return node.children.length;
        } else {
            var totalNodes = 0;
            if (node.children) {
                node.children.forEach(function (d) {
                    totalNodes += getChildrenInLevel(d, level - 1);
                });
            }
            return totalNodes;
        }
    }

    /**
     * Function that returns the sum of children of SIGNIFICANT NODES in a subtree from a given level
     * @param node root of the subtree
     * @param level depth level
     * @returns {number|*} number of SIGNIFICANT child nodes in level
     */
    function getChildrenInLevel2(node, level) {
        let totalNodes = 0;
        if (level == 0 && node.children) {
            return node.children.length;
        } else {
            if (node.children) {
                node.children.forEach(function (d) {
                    if (isSignificant(d, tol)) {
                        totalNodes += getChildrenInLevel2(d, level - 1);
                    }
                });
            }
        }
        return totalNodes;
    }

    /**
     * Function that calculates the growingFactor of a subtree given its root node and a depth
     * @param node root of the subtree
     * @param level depth level
     * @returns {number} growingFactor
     */
    function getGrowFactor(node, level) {
        if (!node.children) { return 0; } //If node is a leaf, return 0
        //check if it has NO significant childs
        let found = false;
        node.children.forEach(d => {
            if (isSignificant(d, tol)) { found = true; }
        });
        if (!found) { return 1; }
        let depth = Math.min(level, getTreeHeight(node));
        //var growFactor = getChildrenInLevel2(node, depth)/node.children.length; //Calculate growingFactor
        var growFactor = getChildrenInLevel2(node, depth)/getChildrenInLevel2(node, 0); //Calculate growingFactor using only significant childs
        return growFactor;
    }

    /**
     * function that determines if a tree has an elongated tendency
     * @param node tree root
     * @param level L parameter
     * @returns {boolean} true if tree is elongated, false if not
     */
    function elongatedTendency(node, level) {
        if (!node.children) { return false; }
        if (node.children.length <= N) {
            let currentGF = 0;
            let isElongated = true;
            let depth = Math.min(level, getTreeHeight(node));
            i = 0;
            while (i <= depth && isElongated) {
                currentGF = getGrowFactor(node, i);
                //if ((1.0-tol) >= currentGF || currentGF >= (1.0+tol)) { isElongated = false; }
                if (currentGF >= GFelon) { isElongated = false; }
                i++;
            }
            return isElongated;
        }
        return false;
    }

    /**
     * function that determines if a tree has a compact tendency
     * @param node tree root
     * @param level L parameter
     * @param limitGF GF parameter
     * @returns {boolean} true if tree is compact, false if not
     */
    function compactTendency(node, level, limitGF) {
        if (!node.children) { return false; }
        if (node.children.length >= N) {
            let currentGF = 0;
            let isCompact = true;
            let depth = Math.min(level, getTreeHeight(node));
            if (depth == 1) { return isCompact; }
            i = 0;
            while (i <= depth && isCompact) {
                currentGF = getGrowFactor(node, i);
                if (currentGF < limitGF && currentGF != 0) { isCompact = false; }
                i++;
            }
            return isCompact;
        }
        return false;
    }

    //CHANGE NAME OF d, get CT node and search there for ET
    function getHierarchy(node, level, limitGF, d_level) {
        let queue = [];
        let CTnode = undefined;
        //let depth = Math.min(L, getTreeHeight(node));

        if (elongatedTendency(node, level)) {
            queue.push(node);
            let found = false;
            while (queue.length > 0 && !found) { //Search all tree until a CT node is found
                let n = queue.shift();
                //let s = getLevelRange(n);
                let s = Math.min(L, getTreeHeight(n));
                if ((n.depth + s) > level) { s = level - n.depth; }
                if (compactTendency(n, s, limitGF)) { found = true; }
                if (n.children && (s > 0)) {
                    n.children.forEach(d => {
                        queue.push(d);
                    });
                }
            }
            if (found) { return 4; } //Hybrid
            else { return 1; } //Elongated
        }
        else if (compactTendency(node, level, limitGF)) { CTnode = node; }
        else {
            CTnode = findTendency(node, level, limitGF, d_level, 1);
        }

        if (CTnode != undefined) {
            queue.push(CTnode);
            let found = false;
            console.log("is Compact");
            while (queue.length > 0 && !found) { //Search all subtree until an ET node is found
                let n = queue.shift();
                //let s = getLevelRange(n);
                let s = Math.min(L, getTreeHeight(n));
                if ((n.depth + s) > level) { s = level - n.depth; } //Limit search range
                if (elongatedTendency(n, s) && getGrowFactor(n, s) != 1) {
                    //if (!isSpine(n, s)) { found = true; } //ignore spines
                    if (isSignificant(n, tol)) {
                        console.log("found significant ET");
                        found = true;
                    }
                }
                if (n.children && (s > 0)) {
                    n.children.forEach(d => {
                        if (isSignificant(d, tol)) { queue.push(d); }
                    });
                }
            }
            if (found) { return 4; } //Hybrid
            else { //Compact or nComp
                console.log("d: " + d_level);
                /*if (findTendency(node, level, limitGF, d_level, 2)) { return 3; } //nComp
                else { return 2; } //Compact*/
                CTnode = findTendency(node, level, limitGF, d_level, 2);
                if (CTnode != undefined) {
                    console.log(CTnode.name);
                    return 3; }
                else { return 2; }
            }
        }

        else { return 0; } //Unspecified
    }

    function findTendency(node, level, limitGF, limit_d, type) {
        let queue = [];
        let CTnode = undefined;
        let found = false;
        queue.push(node);

        while (queue.length > 0 && !found) {
            let n = queue.shift();
            //let s = getLevelRange(n);
            let s = Math.min(L, getTreeHeight(n));
            if ((n.depth + s) > level) { s = level - n.depth; }
            switch(type) {
                case 0: //Elongated
                    return 0;
                case 1: //Compact
                    if (compactTendency(n, s, limitGF)) {
                        CTnode = n;
                        found = true;
                    }
                    if (n.children) {
                        n.children.forEach(d => {
                            if (d.depth < limit_d) { queue.push(d); }
                        });
                    }
                case 2: //nComp
                    if (limit_d == 0) { limit_d++; } //Ignore root case
                    if (n != node) {
                        if ((n.depth >= limit_d) && compactTendency(n, s, limitGF)) {
                            CTnode = n;
                            found = true;
                        }
                    }
                    if (n.children) {
                        n.children.forEach(d => {
                            queue.push(d);
                        });
                    }
            }
        }
        //return found;
        return CTnode;
    }

    /**
     * function that downloads the data of a tree as a CSV document
     * @param node tree root
     * @param filename name of file
     */
    function getTreeData(node, filename) {
        //Define CSV params
        /*let arrayHeader = ["Node", "Width", "Level", "Depth", "subNodes", "maxWidth", "L", "N", "GFcomp",
                            "GFelon", "GrowFactor", "ET", "CT"];*/
        let arrayHeader = ["Node", "Width", "Level", "Depth", "subNodes", "maxWidth", "L", "N", "GFcomp",
                    "GFelon", "GrowFactor", "ET_c1", "ET_c2", "ET_final", "CT_c1", "CT_c2", "CT_final"];
        let header = arrayHeader.join(',') + '\n';
        let csv = header;
        let queue = [];
        queue.push(node);
        //let i = 0;

        while (queue.length > 0) {
            let n = queue.shift();
            let height = getTreeHeight(n);
            //let l = getLevelRange(n);
            let l = Math.min(L, height);
            let numChilds = 0;
            let name = n.name;
            if (n == root) { name = 0; }

            //ET conditions
            let ET_c1 = "FALSE";
            let ET_c2 = "FALSE";
            let CT_c1 = "FALSE";
            let CT_c2 = "FALSE";

            if (n.children) {
                numChilds = n.children.length;
                if (n.children.length <= N) { ET_c1 = "TRUE"; }
                if (n.children.length >= N) { CT_c1 = "TRUE"; }
            }
            let currentGF = 0;
            let isElongated = true;
            let aux = 0;
            while (aux <= l && isElongated) {
                currentGF = getGrowFactor(n, aux);
                //if ((1.0-tol) >= currentGF || currentGF >= (1.0+tol)) { isElongated = false; }
                if (currentGF >= GFelon) { isElongated = false; }
                aux++;
            }
            ET_c2 = isElongated.toString().toUpperCase();

            currentGF = 0;
            let isCompact = true;
            //if (l == 1) { return isCompact; }
            aux = 0;
            while (aux <= l && isCompact) {
                currentGF = getGrowFactor(n, aux);
                if (currentGF < GFcomp) { isCompact = false; }
                aux++;
            }
            CT_c2 = isCompact.toString().toUpperCase();

            let arrayData = [name, numChilds, n.depth, height, getNumberOfNodes(n), getMaxWidth(n, height),
                l, N, GFcomp, GFelon, getGrowFactor(n, l), ET_c1, ET_c2, elongatedTendency(n, l).toString().toUpperCase(),
                CT_c1, CT_c2, compactTendency(n, l, GFcomp).toString().toUpperCase()];
            csv += arrayData.join(',')+'\n';
            if (n.children) {
                //next level
                n.children.forEach(d => {
                    if (isSignificant(d, tol)) { queue.push(d); }
                });
            }
        }

        //Write CSV
        let csvData = new Blob([csv], { type: 'text/csv' });
        let csvUrl = URL.createObjectURL(csvData);

        let hiddenElement = document.createElement('a');
        hiddenElement.href = csvUrl;
        hiddenElement.target = '_blank';
        hiddenElement.download = filename + '.csv';
        hiddenElement.click();
    }
});