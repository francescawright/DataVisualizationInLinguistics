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

/*******************************
*            Tree              *
********************************/

// Variable to check if the ready function code has been completely executed
var codeReadyPopup = false;

/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadiusPopup(d, edgeLength = 300) {
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
function computeDimensionsPopup(nodes) {
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

let currentZoomScalePopup;

function getNodeStrokeWidthPopup() {
    return 1.5;
}

/**
 * Set edge stroke width based on current zoom value
 * */
function getEdgeStrokeWidthPopup() {
    //console.log("Zoom: ", currentZoomScale)
    switch (true) {
        case (currentZoomScalePopup > 7):
            return 1;
        case (currentZoomScalePopup > 6):
            return 2;
        case (currentZoomScalePopup > 4):
            return 3;
        case (currentZoomScalePopup > 3):
            return 4;
        case (currentZoomScalePopup > 1):
            return 5;
        case (currentZoomScalePopup > 0.6):
            return 6;
        case (currentZoomScalePopup > 0.5):
            return 7;
        case (currentZoomScalePopup > 0.4):
            return 8;
        case (currentZoomScalePopup > 0.3):
            return 9;
        case (currentZoomScalePopup > 0.2):
            return 10;
        case (currentZoomScalePopup > 0.1):
            return 11;
        case (currentZoomScalePopup > 0.075):
            return 15;
        case (currentZoomScalePopup > 0):
            return 20;
    }
}

/**
 * Center graph and zoom to fit the whole graph visualization in our canvas
 * */
function zoomToFitGraphPopup(minX, minY, maxX, maxY,
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

    scalePopup = Math.min(canvasWidth / boxWidth, canvasHeight / boxHeight);

    var newX = canvasWidth / 2.0,
        newY = canvasHeight / 2.0;

    if (canvasWidth / boxWidth < canvasHeight / boxHeight) {
        newY -= midX * scalePopup;
        newX -= midY * scalePopup;
    } else newX -= midY * scalePopup;

    //For nodes wider than tall, we need to displace them to the middle of the graph
    if (newY < boxHeight * scalePopup && boxHeight * scalePopup < canvasHeight) newY = canvasHeight / 2.0;

    d3.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + (newX + root.radius * scalePopup) + "," + newY + ")scale(" + scalePopup + ")");

    return {
        initialZoom: scalePopup,
        initialY: newX + root.radius * scalePopup,
        initialX: newY
    }
}

var rootPathPopup = pr;

/**
 * Highlights nodes by category of Toxicity
 * */
function highlightToxicityORPopup(node, enabledHighlight) {
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
function highlightToxicityANDPopup(node, enabledHighlight, opacityValue = 0.1) {
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

function highlightStanceORPopup(node, enabledHighlight) {
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

function highlightStanceANDPopup(node, enabledHighlight, opacityValue = 0.1) {
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
        node.filter(function (d) {
            return !d.highlighted;
        }).style("opacity", opacityValue);
    }
}

function highlightTargetORPopup(node, enabledHighlight) {
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

function highlightTargetANDPopup(node, enabledHighlight, opacityValue = 0.1) {
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

function highlightPositiveORPopup(node, enabledHighlight) {
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

function highlightPositiveANDPopup(node, enabledHighlight, opacityValue = 0.1) {
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

function highlightNegativeORPopup(node, enabledHighlight) {
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

function highlightNegativeANDPopup(node, enabledHighlight, opacityValue = 0.1) {
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
treeJSONPopup = d3.json(dataset, function (error, treeData) {

    // Calculate total nodes, max label length
    var totalNodesPopup = 0;
    var edgeLengthPopup = 300;

    // Misc. variables
    var iPopup = 0;
    var durationPopup = 750;
    var rootPopup, rootNamePopup = "News Article";
    var nodesPopup;

    /* Colours
     * */
    var colourBothStancesPopup = "#FFA500",
        colourPositiveStancePopup = "#77dd77",
        colourNegativeStancePopup = "#ff6961",
        colourNeutralStancePopup = "#2b2727";

    var colourToxicity0Popup = "#f7f7f7",
        colourToxicity1Popup = "#cccccc",
        colourToxicity2Popup = "#737373",
        colourToxicity3Popup = "#000000",
        colourNewsArticlePopup = "lightsteelblue",
        colourCollapsed1SonPopup = "lightsteelblue";


    var objRootPopup = {
        class: "rootNode",
        id: "rootNode",
        fileName: "root.png"
    };
    var imageOffsetPopup = 4; //Radii size difference between a node and its associated image
    var imgRatioPopup = 10; //Percentage of difference between the radii of a node and its associated image

    var colorFeaturePopup = ["#90F6B2", "#1B8055",
        "#97CFFF", "#1795FF", "#0B5696",
        "#E3B7E8", "#A313B3", "#5E1566"
    ];

    /* Targets: size, position, local path, objects to draw the target as ring
     * */
    var targetIconHeightPopup = 15,
        targetIconWidthPopup = 15,
        targetIconGroupXPopup = -30,
        targetIconPersonXPopup = -50,
        targetIconStereotypeXPopup = -70,
        targetIconYPopup = -10; //Size and relative position of targets drawn as icons
    var pathTargetsPopup = pt;

    var objTargetGroupRingPopup = {
            class: "targetGroup",
            id: "targetGroup",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Group.png"
        },
        objTargetPersonRingPopup = {
            class: "targetPerson",
            id: "targetPerson",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Person.png"
        },
        objTargetStereotypeRingPopup = {
            class: "targetStereotype",
            id: "targetStereotype",
            x: -10,
            y: -10,
            height: 20,
            width: 20,
            fileName: "Stereotype.png"
        },
        objTargetGrayRingPopup = {
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
    var cheeseXPopup = 15,
        cheeseYPopup = -10,
        cheeseHeightPopup = 20,
        cheeseWidthPopup = 20;
    var pathFeaturesPopup = pf;

    // Objects for toxicities for Ecem tests
    var objToxicity0Popup = {
            class: "toxicity0",
            id: "toxicity0",
            selected: 1,
            fileName: "Level0.svg"
        },
        objToxicity1Popup = {
            class: "toxicity1",
            id: "toxicity1",
            selected: 1,
            fileName: "Level1.svg"
        },
        objToxicity2Popup = {
            class: "toxicity2",
            id: "toxicity2",
            selected: 1,
            fileName: "Level2.svg"
        },
        objToxicity3Popup = {
            class: "toxicity3",
            id: "toxicity3",
            selected: 1,
            fileName: "Level3.svg"
        };
    var drawingAllInOnePopup = false; //if we are drawing all together or separated


    // size of the diagram
    var viewerWidthPopup = 100;
    var viewerHeightPopup = 400;

    var canvasHeightPopup = document.querySelector(".modal .modal-body").offsetHeight,
        canvasWidthPopup = document.querySelector(".modal .modal-body").offsetWidth; //Dimensions of our canvas (grayish area)
    var initialZoomPopup, initialXPopup, initialYPopup; //Initial zoom and central coordinates of the first visualization of the graph

    var separationHeightPopup = 10; //Desired separation between two node brothers
    var radiusFactorPopup = 2; // The factor by which we multiply the radius of a node when collapsed with more than 2 children

    var opacityValuePopup = 0.1; // Opacity when a value is not highlighted
    var tooltipTextPopup; // The variable displaying the information of a node inside a floating rectangle

    rootPopup = treeData; //Define the root

    // Used to obtain the nodes belonging to the deepest thread
    var deepestNodesPathPopup;

    /* Creation of the tree with nodeSize
     * We indicate the reserved area for each node as [height, width] since our tree grows horizontally
     * Sorts nodes by level of toxicity (from lower to higher)
     *
     * NOTE: tree must be sorted at the creation of the tree, otherwise when collapsing and uncollapsing a node
     * the order of the nodes might change, disturbing the user mental map of the tree
     *
     * */
    var treePopup = d3.layout.tree()
        .nodeSize(rootPopup.children.length, 0) //NOTE the width is overwritten later
        .sort(function (a, b) {
            return d3.ascending(a.toxicity_level, b.toxicity_level); //NOTE: this avoids the tree being sorted and changed when collapsing a node
        });

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonalPopup = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });
    // Hover rectangle in which the information of a node is displayed
    var tooltipPopup = d3.select(popup_container)
        .append("div")
        .attr("class", "my-tooltip") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "60")
        .style("visibility", "hidden");


    /* SECTION Zoom*/
    var zoomLabelPopup = document.getElementById("zoom_level");
    var XLabelPopup = document.getElementById("position_x");
    var YLabelPopup = document.getElementById("position_y");

    /*SECTION checkboxes*/

    //Check the values of the checkboxes and do something
    var checkboxPopup = document.querySelector("input[name=cbTargets]");
    var checkboxesTargetsPopup = [document.getElementById("target-group"), document.getElementById("target-person"), document.getElementById("target-stereotype")]; //document.querySelectorAll("input[type=checkbox][name=cbTargets]");

    let enabledTargetsPopup = []; //Variable which contains the string of the enabled options to display targets

    // Select all checkboxes with the name 'cbFeatures' using querySelectorAll.
    var checkboxesPopup = document.querySelectorAll("input[type=checkbox][name=cbFeatures]");
    let enabledFeaturesPopup = []; //Variable which contains the string of the enabled options to display features
    // var checkboxFeatureMenuPopup = document.querySelector("input[name=cbFeatureMenu]");

    // Select how to display the features: svg circles or trivial cheese
    var checkboxesPropertyFeaturePopup = document.querySelectorAll("input[type=checkbox][name=cbFeatureProperty]");
    var checkboxFeatureDotPopup = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=dot-feat]");
    var checkboxFeatureCheesePopup = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=cheese-feat]");

    //Dropdown menu
    var checkboxesPositioningFeaturePopup = document.querySelectorAll("input[type=checkbox][name=cbFeaturePositioning]");
    // var cbFeatureInsidePopup = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=on-node]");
    // var cbFeatureOutsidePopup = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=node-outside]");

    // Select which properties and if an intersection or union of those
    var checkboxHighlightMenuPopup = document.querySelector("input[name=cbHighlightMenu]");
    var checkboxesPropertyPopup = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
    var checkboxANDPopup = document.querySelector("input[type=radio][name=cbHighlightProperty][value=and-group]");
    var checkboxORPopup = document.querySelector("input[type=radio][name=cbHighlightProperty][value=or-group]");
    var checkboxesHighlightGroupORPopup = document.querySelectorAll("input[name=cbHighlightOR]");
    var checkboxesHighlightGroupANDPopup = document.querySelectorAll("input[name=cbHighlightAND]");

    let enabledHighlightPopup = []; //Variable which contains the string of the enabled options to highlight
    /*END SECTION checkboxes*/

    var checkButtonsPopup = document.querySelectorAll("input[name=check_button_features]");

    // Objects for target images
    var objTargetGroupPopup = {
            class: "targetGroup",
            id: "targetGroup",
            selected: enabledTargetsPopup.indexOf("target-group"),
            x: -30,
            y: -10,
            height: targetIconHeightPopup,
            width: targetIconWidthPopup,
            fileName: "Group.svg"
        },
        objTargetPersonPopup = {
            class: "targetPerson",
            id: "targetPerson",
            selected: enabledTargetsPopup.indexOf("target-person"),
            x: -50,
            y: -10,
            height: targetIconHeightPopup,
            width: targetIconWidthPopup,
            fileName: "Person.svg"
        },
        objTargetStereotypePopup = {
            class: "targetStereotype",
            id: "targetStereotype",
            selected: enabledTargetsPopup.indexOf("target-stereotype"),
            x: -70,
            y: -10,
            height: targetIconHeightPopup,
            width: targetIconWidthPopup,
            fileName: "Stereotype.svg"
        };


    var objTargetGroupInsidePopup = {
            class: "targetGroup",
            id: "targetGroup",
            selected: enabledTargetsPopup.indexOf("target-group"),
            x: -0.9,
            y: -0.8,
            height: targetIconHeightPopup,
            width: targetIconWidthPopup,
            fileName: "icons/Group.svg"
        },
        objTargetPersonInsidePopup = {
            class: "targetPerson",
            id: "targetPerson",
            selected: enabledTargetsPopup.indexOf("target-person"),
            x: -0.5,
            y: 0,
            height: targetIconHeightPopup,
            width: targetIconWidthPopup,
            fileName: "icons/Person.svg"
        },
        objTargetStereotypeInsidePopup = {
            class: "targetStereotype",
            id: "targetStereotype",
            selected: enabledTargetsPopup.indexOf("target-stereotype"),
            x: -0.1,
            y: -0.8,
            height: targetIconHeightPopup,
            width: targetIconWidthPopup,
            fileName: "icons/Stereotype.svg"
        };


    // Objects for feature images
    var objFeatArgumentationPopup = {
            class: "featArgumentation",
            id: "featArgumentation",
            selected: enabledFeaturesPopup.indexOf("argumentation"),
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Argumentation.svg"
        },
        objFeatConstructivenessPopup = {
            class: "featConstructiveness",
            id: "featConstructiveness",
            selected: enabledFeaturesPopup.indexOf("constructiveness"),
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Constructiveness.svg"
        },
        objFeatSarcasmPopup = {
            class: "featSarcasm",
            id: "featSarcasm",
            selected: enabledFeaturesPopup.indexOf("sarcasm"),
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Sarcasm.svg"
        },
        objFeatMockeryPopup = {
            class: "featMockery",
            id: "featMockery",
            selected: enabledFeaturesPopup.indexOf("mockery"),
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Mockery.svg"
        },
        objFeatIntolerancePopup = {
            class: "featIntolerance",
            id: "featIntolerance",
            selected: enabledFeaturesPopup.indexOf("intolerance"),
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Intolerance.svg"
        },
        objFeatImproperPopup = {
            class: "featImproper",
            id: "featImproper",
            selected: enabledFeaturesPopup.indexOf("improper_language"),
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Improper.svg"
        },
        objFeatInsultPopup = {
            class: "featInsult",
            id: "featInsult",
            selected: enabledFeaturesPopup.indexOf("insult"),
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Insult.svg"
        },
        objFeatAggressivenessPopup = {
            class: "featAggressiveness",
            selected: enabledFeaturesPopup.indexOf("aggressiveness"),
            id: "featAggressiveness",
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Aggressiveness.svg"
        },
        objFeatGrayPopup = {
            class: "featGray",
            id: "featGray",
            selected: 1,
            x: cheeseXPopup,
            y: cheeseYPopup,
            height: cheeseHeightPopup,
            width: cheeseWidthPopup,
            fileName: "Gray.svg"
        };


    // var dropdownTargets = document.getElementById("dropdown-targets");
    var dropdownFeaturesPopup = document.getElementById("dropdown-features");

    var dotsFeaturesPopup = document.getElementById("dots_icon_button");
    var glyphsFeaturesPopup = document.getElementById("glyphs_icon_button");

    // A recursive helper function for performing some setup by walking through all nodes
    function visitPopup(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visitPopup(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish edgeLength
    visitPopup(treeData, function (d) {
        totalNodesPopup++;
    }, function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    var currentXPopup = initialXPopup;
    var currentYPopup = initialYPopup;
    var currentScalePopup = initialZoomPopup;

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
        currentZoomScalePopup = d3.event.scale

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
        drawZoomValue(newScale);
        currentScale = newScale;
    }
    */

    function zoomPopup() {
        var zoomPopup = d3.event;
        svgGroupPopup.attr("transform", "translate(" + zoomPopup.translate + ")scale(" + zoomPopup.scale + ")");
        drawZoomValue(zoomPopup.scale);
        currentScalePopup = zoomPopup.scale;
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListenerPopup = d3.behavior
        .zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", function () {
            currentZoomScalePopup = d3.event.scale
            linkPopup.style("stroke-width", getEdgeStrokeWidthPopup()); //Enlarge stroke-width on zoom out
            nodePopup.select("circle").style("stroke-width", getNodeStrokeWidthPopup()); //Enlarge stroke-width on zoom out
            zoomPopup();
        });

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvgPopup = d3
        .select(popup_container)
        .append("svg")
        .attr("width", canvasWidthPopup)
        .attr("height", canvasHeightPopup)
        .attr("class", "overlay-popup")
        .call(zoomListenerPopup);


    var svgGroupPopup = baseSvgPopup.append("g");

    var linkPopup = svgGroupPopup.selectAll("path.link"),
        nodePopup = svgGroupPopup.selectAll("g.node");


    /**
     * Center the screen to the position of the given node
     * */
    function centerNodePopup(source) {
        scalePopup = zoomListenerPopup.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scalePopup + viewerWidthPopup / 2;
        y = y * scalePopup + viewerHeightPopup / 2;
        d3.select("g")
            .transition()
            .duration(durationPopup)
            .attr(
                "transform",
                "translate(" + x + "," + y + ")scale(" + scalePopup + ")"
            );
        zoomListenerPopup.scale(scalePopup);
        zoomListenerPopup.translate([x, y]);
    }

    /**
     * Center the screen to the position of the given link
     * */
    function centerLink(link) {
        scalePopup = zoomListenerPopup.scale();
        x = -(link.source.y0 + link.target.y0) / 2;
        y = -(link.source.x0 + link.target.x0) / 2;
        x = x * scalePopup + viewerWidthPopup / 2;
        y = y * scalePopup + viewerHeightPopup / 2;
        d3.select("g")
            .transition()
            .duration(durationPopup)
            .attr(
                "transform",
                "translate(" + x + "," + y + ")scale(" + scalePopup + ")"
            );
        zoomListenerPopup.scale(scalePopup);
        zoomListenerPopup.translate([x, y]);
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
        updatePopup(d, false); //NOTE: we are passing each sun that was collapsed
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
    function positionImage(nodeRadius, radiusPercentage = imgRatioPopup) {
        return nodeRadius * (radiusPercentage / 100.0 - 1);
    }

    /**
     * Compute the size of an associated image to be a radiusPercentage smaller than the node
     * */
    function sizeImage(nodeRadius, radiusPercentage = imgRatioPopup) {
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
            enabledTargetsPopup.indexOf("target-group"),
            enabledTargetsPopup.indexOf("target-person"),
            enabledTargetsPopup.indexOf("target-stereotype"),
        ];
        var listOpacity;
        var targets = [objTargetGroupPopup, objTargetPersonPopup, objTargetStereotypePopup];

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
                    .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
            enabledTargetsPopup.indexOf("target-group"),
            enabledTargetsPopup.indexOf("target-person"),
            enabledTargetsPopup.indexOf("target-stereotype"),
        ];
        var listOpacity;
        var targets = [objTargetGroupPopup, objTargetPersonPopup, objTargetStereotypePopup];

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
                    .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
            enabledTargetsPopup.indexOf("target-group"),
            enabledTargetsPopup.indexOf("target-person"),
            enabledTargetsPopup.indexOf("target-stereotype"),
        ];
        var listOpacity;
        var targets = [
            objTargetGroupInsidePopup,
            objTargetPersonInsidePopup,
            objTargetStereotypeInsidePopup,
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
                    .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
            enabledTargetsPopup.indexOf("target-group"),
            enabledTargetsPopup.indexOf("target-person"),
            enabledTargetsPopup.indexOf("target-stereotype"),
        ]; //Note: we will always display the gray ring
        var listOpacity;
        var targets = [
            objTargetGrayRingPopup,
            objTargetGroupRingPopup,
            objTargetPersonRingPopup,
            objTargetStereotypeRingPopup,
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
                    .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
        if (drawingAllInOnePopup) selectFeatureVisualization(nodeEnter);
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
                    enabledTargetsPopup.length > 1 ?
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
            .attr("x", targetIconGroupXPopup) //NOTE: it is always displayed at the left side!!
            .attr("y", targetIconYPopup)
            .attr("height", targetIconHeightPopup)
            .attr("width", targetIconWidthPopup)
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
            .attr("x", targetIconPersonXPopup) //NOTE: it is always displayed at the left side!!
            .attr("y", targetIconYPopup)
            .attr("height", targetIconHeightPopup)
            .attr("width", targetIconWidthPopup)
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
            .attr("x", targetIconStereotypeXPopup) //NOTE: it is always displayed at the left side!!
            .attr("y", targetIconYPopup)
            .attr("height", targetIconHeightPopup)
            .attr("width", targetIconWidthPopup)
            .attr("href", "./icons/TargetStereotype.png")
            .attr("opacity", function (d) {
                if (d.stereotype) return 1;
                return 0;
            });
    }

    function visualiseTargets(nodeEnter) {
        enabledTargetsPopup.indexOf("target-group") > -1 ?
            drawTargetGroup(nodeEnter) :
            d3.selectAll("#targetGroup").remove();
        enabledTargetsPopup.indexOf("target-person") > -1 ?
            drawTargetPerson(nodeEnter) :
            d3.selectAll("#targetPerson").remove();
        enabledTargetsPopup.indexOf("target-stereotype") > -1 ?
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
        checkboxesPopup.forEach((cb) => (cb.checked = !cb.checked));
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
            enabledFeaturesPopup.indexOf("constructiveness"),
            enabledFeaturesPopup.indexOf("argumentation"),
            enabledFeaturesPopup.indexOf("sarcasm"),
            enabledFeaturesPopup.indexOf("mockery"),
            enabledFeaturesPopup.indexOf("intolerance"),
            enabledFeaturesPopup.indexOf("improper_language"),
            enabledFeaturesPopup.indexOf("insult"),
            enabledFeaturesPopup.indexOf("aggressiveness"),
        ];

        var features = [
            objFeatConstructivenessPopup,
            objFeatArgumentationPopup,
            objFeatSarcasmPopup,
            objFeatMockeryPopup,
            objFeatIntolerancePopup,
            objFeatImproperPopup,
            objFeatInsultPopup,
            objFeatAggressivenessPopup,
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
                    .attr("fill", colorFeaturePopup[i])
                    .style("stroke", "black")
                    .style("stroke-width", getNodeStrokeWidthPopup())
            }
        }
    }

    function drawFeatureAsCheeseOutside(nodeEnter, localPath) {
        removeThisFeatures(nodeEnter);
        removeToxicities(nodeEnter); //Remove all the pngs for toxicity

        //Add the gray cheese
        nodeEnter
            .append("image")
            .attr("class", objFeatGrayPopup.class)
            .attr("id", objFeatGrayPopup.id)
            .attr("x", objFeatGrayPopup.x) //NOTE: it is always displayed at the left side!!
            .attr("y", objFeatGrayPopup.y)
            .attr("height", objFeatGrayPopup.height)
            .attr("width", objFeatGrayPopup.width)
            .attr("href", pathFeaturesPopup + localPath + objFeatGrayPopup.fileName)
            .attr("opacity", function (d) {
                if (d.parent === undefined) return 0;
                return 0.5;
            });

        var cbFeatureEnabled = [
            enabledFeaturesPopup.indexOf("argumentation"),
            enabledFeaturesPopup.indexOf("constructiveness"),
            enabledFeaturesPopup.indexOf("sarcasm"),
            enabledFeaturesPopup.indexOf("mockery"),
            enabledFeaturesPopup.indexOf("intolerance"),
            enabledFeaturesPopup.indexOf("improper_language"),
            enabledFeaturesPopup.indexOf("insult"),
            enabledFeaturesPopup.indexOf("aggressiveness"),
        ];

        var features = [
            objFeatArgumentationPopup,
            objFeatConstructivenessPopup,
            objFeatSarcasmPopup,
            objFeatMockeryPopup,
            objFeatIntolerancePopup,
            objFeatImproperPopup,
            objFeatInsultPopup,
            objFeatAggressivenessPopup,
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
                    .attr("href", pathFeaturesPopup + localPath + features[i].fileName)
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
            .attr("class", objFeatGrayPopup.class)
            .attr("id", objFeatGrayPopup.id)
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
            .attr("href", pathFeaturesPopup + localPath + objFeatGrayPopup.fileName)
            .attr("opacity", function (d) {
                return 0.5;
            });

        var cbFeatureEnabled = [
            enabledFeaturesPopup.indexOf("argumentation"),
            enabledFeaturesPopup.indexOf("constructiveness"),
            enabledFeaturesPopup.indexOf("sarcasm"),
            enabledFeaturesPopup.indexOf("mockery"),
            enabledFeaturesPopup.indexOf("intolerance"),
            enabledFeaturesPopup.indexOf("improper_language"),
            enabledFeaturesPopup.indexOf("insult"),
            enabledFeaturesPopup.indexOf("aggressiveness"),
        ];

        var features = [
            objFeatArgumentationPopup,
            objFeatConstructivenessPopup,
            objFeatSarcasmPopup,
            objFeatMockeryPopup,
            objFeatIntolerancePopup,
            objFeatImproperPopup,
            objFeatInsultPopup,
            objFeatAggressivenessPopup,
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
                    .attr("href", pathFeaturesPopup + localPath + features[i].fileName)
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
            objToxicity0Popup,
            objToxicity1Popup,
            objToxicity2Popup,
            objToxicity3Popup,
            objFeatArgumentationPopup,
            objFeatConstructivenessPopup,
            objFeatSarcasmPopup,
            objFeatMockeryPopup,
            objFeatIntolerancePopup,
            objFeatImproperPopup,
            objFeatInsultPopup,
            objFeatAggressivenessPopup,
            objTargetGroupPopup,
            objTargetPersonPopup,
            objTargetStereotypePopup,
        ];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [
            1,
            1,
            1,
            1,
            enabledFeaturesPopup.indexOf("argumentation"),
            enabledFeaturesPopup.indexOf("constructiveness"),
            enabledFeaturesPopup.indexOf("sarcasm"),
            enabledFeaturesPopup.indexOf("mockery"),
            enabledFeaturesPopup.indexOf("intolerance"),
            enabledFeaturesPopup.indexOf("improper_language"),
            enabledFeaturesPopup.indexOf("insult"),
            enabledFeaturesPopup.indexOf("aggressiveness"),
            enabledTargetsPopup.indexOf("target-group"),
            enabledTargetsPopup.indexOf("target-person"),
            enabledTargetsPopup.indexOf("target-stereotype"),
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
                        pathFeaturesPopup + localPath + allObjectsInNode[i].fileName
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
            objFeatGrayPopup,
            objFeatArgumentationPopup,
            objFeatConstructivenessPopup,
            objFeatSarcasmPopup,
            objFeatMockeryPopup,
            objFeatIntolerancePopup,
            objFeatImproperPopup,
            objFeatInsultPopup,
            objFeatAggressivenessPopup,
            objToxicity0Popup,
            objToxicity1Popup,
            objToxicity2Popup,
            objToxicity3Popup,
            //objTargetGroup,
            //objTargetPerson,
            //objTargetStereotype,
        ];
        var listOpacity;

        //Better done than perfect
        var cbShowTargets = [
            1,
            enabledFeaturesPopup.indexOf("argumentation"),
            enabledFeaturesPopup.indexOf("constructiveness"),
            enabledFeaturesPopup.indexOf("sarcasm"),
            enabledFeaturesPopup.indexOf("mockery"),
            enabledFeaturesPopup.indexOf("intolerance"),
            enabledFeaturesPopup.indexOf("improper_language"),
            enabledFeaturesPopup.indexOf("insult"),
            enabledFeaturesPopup.indexOf("aggressiveness"),
            1,
            1,
            1,
            1,
            enabledTargetsPopup.indexOf("target-group"),
            enabledTargetsPopup.indexOf("target-person"),
            enabledTargetsPopup.indexOf("target-stereotype"),
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
                    .style("stroke-width", getNodeStrokeWidthPopup())
                    .attr(
                        "href",
                        pathFeaturesPopup + localPath + allObjectsInNode[i].fileName
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

        if (dotsFeaturesPopup.checked) {
            option = "dots";
        }

        if (glyphsFeaturesPopup.checked) {
            option = "directory-2";
        }

        // document.getElementById(
        //     "feature-over-node-or-outside"
        // ).style.display = "none"; //Hide the dropdown menu
        drawingAllInOnePopup = false;
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
                drawingAllInOnePopup = false;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById(
                //     "feature-over-node-or-outside"
                // ).style.display = "block"; //Show the dropdown menu
                selectTargetVisualization(nodeEnter); //draw the targets if necessary

                drawFeatureAsGlyph(nodeEnter, "Bubble/", localPosition);
                break;
            case "directory-2":
                drawingAllInOnePopup = false;
                //Deletes the targets and draws them again but INSIDE of the node
                // document.getElementById(
                //     "feature-over-node-or-outside"
                // ).style.display = "block"; //Show the dropdown menu
                selectTargetVisualization(nodeEnter); //draw the targets if necessary
                drawFeatureAsCircularGlyph(nodeEnter, "NewCircular/", localPosition);
                break;

            case "new-circular":
                drawingAllInOnePopup = false;
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
                drawingAllInOnePopup = false;
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
            .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
            .attr("y", cheeseYPopup)
            .attr("height", cheeseHeightPopup)
            .attr("width", cheeseWidthPopup)
            .attr("href", "./featuresCheese/Gimp/grayCheese.png")
            .attr("opacity", 0.5);

        // Argumentation
        if (enabledFeaturesPopup.indexOf("argumentation") > -1) {
            nodeEnter
                .append("image")
                .attr("class", "cheeseArgumentation")
                .attr("id", "cheeseArgumentation")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
                .attr("href", "./featuresCheese/Gimp/Argumentation.png")
                .attr("opacity", function (d) {
                    if (d.argumentation) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeaturesPopup.indexOf("constructiveness") > -1) {
            // Constructiveness
            nodeEnter
                .append("image")
                .attr("class", "cheeseConstructiveness")
                .attr("id", "cheeseConstructiveness")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
                .attr("href", "./featuresCheese/Gimp/Constructiveness.png")
                .attr("opacity", function (d) {
                    if (d.constructiveness) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }

        if (enabledFeaturesPopup.indexOf("sarcasm") > -1) {
            // Sarcasm
            nodeEnter
                .append("image")
                .attr("class", "cheeseSarcasm")
                .attr("id", "cheeseSarcasm")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
                .attr("href", "./featuresCheese/Gimp/Sarcasm.png")
                .attr("opacity", function (d) {
                    if (d.sarcasm) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeaturesPopup.indexOf("mockery") > -1) {
            // Mockery
            nodeEnter
                .append("image")
                .attr("class", "cheeseMockery")
                .attr("id", "cheeseMockery")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
                .attr("href", "./featuresCheese/Gimp/Mockery.png")
                .attr("opacity", function (d) {
                    if (d.mockery) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeaturesPopup.indexOf("intolerance") > -1) {
            // Intolerance
            nodeEnter
                .append("image")
                .attr("class", "cheeseIntolerance")
                .attr("id", "cheeseIntolerance")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
                .attr("href", "./featuresCheese/Gimp/Intolerance.png")
                .attr("opacity", function (d) {
                    if (d.intolerance) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }

        if (enabledFeaturesPopup.indexOf("improper_language") > -1) {
            // Improper Language
            nodeEnter
                .append("image")
                .attr("class", "cheeseImproper")
                .attr("id", "cheeseImproper")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
                .attr("href", "./featuresCheese/Gimp/Improper.png")
                .attr("opacity", function (d) {
                    if (d.improper_language) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeaturesPopup.indexOf("insult") > -1) {
            // Insult
            nodeEnter
                .append("image")
                .attr("class", "cheeseInsult")
                .attr("id", "cheeseInsult")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
                .attr("href", "./featuresCheese/Gimp/Insult.png")
                .attr("opacity", function (d) {
                    if (d.insult) return 1;
                    return 0; //We need to set the opacity or it will always be displayed!
                });
        }
        if (enabledFeaturesPopup.indexOf("aggressiveness") > -1) {
            // Aggressiveness
            nodeEnter
                .append("image")
                .attr("class", "cheeseAggressiveness")
                .attr("id", "cheeseAggressiveness")
                .attr("x", cheeseXPopup) //NOTE: it is always displayed at the left side!!
                .attr("y", cheeseYPopup)
                .attr("height", cheeseHeightPopup)
                .attr("width", cheeseWidthPopup)
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
        if (enabledFeaturesPopup.indexOf("argumentation") > -1) {
            nodeEnter
                .append("circle")
                .attr("class", "featureArgumentation")
                .attr("id", "featureArgumentation")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 35 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[0])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
                .attr("opacity", function (d) {
                    if (d.argumentation) return 1; //If node contains argumentation
                    return 0; //We hide it if it has no argumentation
                });
        }

        if (enabledFeaturesPopup.indexOf("constructiveness") > -1) {
            // Constructiveness
            nodeEnter
                .append("circle")
                .attr("class", "featureConstructiveness")
                .attr("id", "featureConstructiveness")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 45 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[1])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
                .attr("opacity", function (d) {
                    if (d.constructiveness) return 1;
                    return 0;
                });
        }
        if (enabledFeaturesPopup.indexOf("sarcasm") > -1) {
            // Sarcasm
            nodeEnter
                .append("circle")
                .attr("class", "featureSarcasm")
                .attr("id", "featureSarcasm")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 55 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[2])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
                .attr("opacity", function (d) {
                    if (d.sarcasm) return 1;
                    return 0;
                });
        }
        if (enabledFeaturesPopup.indexOf("mockery") > -1) {
            // Mockery
            nodeEnter
                .append("circle")
                .attr("class", "featureMockery")
                .attr("id", "featureMockery")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 65 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[3])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
                .attr("opacity", function (d) {
                    if (d.mockery) return 1;
                    return 0;
                });
        }
        if (enabledFeaturesPopup.indexOf("intolerance") > -1) {
            // Intolerance
            nodeEnter
                .append("circle")
                .attr("class", "featureIntolerance")
                .attr("id", "featureIntolerance")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 75 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[4])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
                .attr("opacity", function (d) {
                    if (d.intolerance) return 1;
                    return 0;
                });
        }

        if (enabledFeaturesPopup.indexOf("improper_language") > -1) {
            // Improper Language
            nodeEnter
                .append("circle")
                .attr("class", "featureImproperLanguage")
                .attr("id", "featureImproperLanguage")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 95 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[5])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
                .attr("opacity", function (d) {
                    if (d.improper_language) return 1;
                    return 0;
                });
        }

        if (enabledFeaturesPopup.indexOf("insult") > -1) {
            // Insult
            nodeEnter
                .append("circle")
                .attr("class", "featureInsult")
                .attr("id", "featureInsult")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 105 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[6])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
                .attr("opacity", function (d) {
                    if (d.insult) return 1;
                    return 0;
                });
        }
        if (enabledFeaturesPopup.indexOf("aggressiveness") > -1) {
            // Aggressiveness
            nodeEnter
                .append("circle")
                .attr("class", "featureAggressiveness")
                .attr("id", "featureAggressiveness")
                .attr("r", "4.5")
                .attr("transform", "translate(" + 115 + "," + 0 + ")")
                .attr("fill", colorFeaturePopup[7])
                .style("stroke", "black")
                .style("stroke-width", getNodeStrokeWidthPopup())
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
            .attr("class", objRootPopup.class)
            .attr("id", objRootPopup.id)
            .attr("x", rootPopup.x - rootPopup.radius)
            .attr("y", rootPopup.y - rootPopup.radius)
            .attr("height", rootPopup.radius * 2)
            .attr("width", rootPopup.radius * 2)
            .attr("href", rootPathPopup + objRootPopup.fileName)
            .attr("opacity", 1);
    }

    /*SECTION highlighting */
    function highlightByPropertyOR(node, link) {
        node.style("opacity", 0.2);
        link.style("opacity", 0.2);

        //Toxicity 0
        if (enabledHighlightPopup.indexOf("highlight-toxicity-0") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-toxicity-1") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-toxicity-2") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-toxicity-3") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-neutral") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-positive") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-negative") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-group") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-person") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-stereotype") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-argumentation") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-constructiveness") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-sarcasm") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-mockery") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-intolerance") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-improper-language") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-insult") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-aggressiveness") > -1) {
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
        if (enabledHighlightPopup.indexOf("highlight-toxicity-0") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 0;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 0;
                })
                .style("opacity", opacityValuePopup);
        }

        //Toxicity not 1
        if (enabledHighlightPopup.indexOf("highlight-toxicity-1") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 1;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 1;
                })
                .style("opacity", opacityValuePopup);
        }

        //Toxicity not 2
        if (enabledHighlightPopup.indexOf("highlight-toxicity-2") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 2;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 2;
                })
                .style("opacity", opacityValuePopup);
        }

        //Toxicity not 3
        if (enabledHighlightPopup.indexOf("highlight-toxicity-3") > -1) {
            node
                .filter(function (d) {
                    return d.toxicity_level !== 3;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return d.target.toxicity_level !== 3;
                })
                .style("opacity", opacityValuePopup);
        }

        //Neutral stance CB is checked
        if (enabledHighlightPopup.indexOf("highlight-neutral") > -1) {
            node
                .filter(function (d) {
                    return d.positive_stance || d.negative_stance;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return d.target.positive_stance || d.target.negative_stance;
                })
                .style("opacity", opacityValuePopup);
        }

        //Positive stance CB is checked
        if (enabledHighlightPopup.indexOf("highlight-positive") > -1) {
            node
                .filter(function (d) {
                    return !d.positive_stance;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.positive_stance;
                })
                .style("opacity", opacityValuePopup);
        }

        //Negative stance CB is checked
        if (enabledHighlightPopup.indexOf("highlight-negative") > -1) {
            node
                .filter(function (d) {
                    return !d.negative_stance;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.negative_stance;
                })
                .style("opacity", opacityValuePopup);
        }

        //Target group CB is checked
        if (enabledHighlightPopup.indexOf("highlight-group") > -1) {
            node
                .filter(function (d) {
                    return !d.target_group;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.target_group;
                })
                .style("opacity", opacityValuePopup);
        }

        //Target person CB is checked
        if (enabledHighlightPopup.indexOf("highlight-person") > -1) {
            node
                .filter(function (d) {
                    return !d.target_person;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.target_person;
                })
                .style("opacity", opacityValuePopup);
        }

        //Stereotype CB is checked
        if (enabledHighlightPopup.indexOf("highlight-stereotype") > -1) {
            node
                .filter(function (d) {
                    return !d.stereotype;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.stereotype;
                })
                .style("opacity", opacityValuePopup);
        }

        //Argumentation CB is checked
        if (enabledHighlightPopup.indexOf("highlight-argumentation") > -1) {
            node
                .filter(function (d) {
                    return !d.argumentation;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.argumentation;
                })
                .style("opacity", opacityValuePopup);
        }

        //Constructiveness CB is checked
        if (enabledHighlightPopup.indexOf("highlight-constructiveness") > -1) {
            node
                .filter(function (d) {
                    return !d.constructiveness;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.constructiveness;
                })
                .style("opacity", opacityValuePopup);
        }

        //Sarcasm CB is checked
        if (enabledHighlightPopup.indexOf("highlight-sarcasm") > -1) {
            node
                .filter(function (d) {
                    return !d.sarcasm;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.sarcasm;
                })
                .style("opacity", opacityValuePopup);
        }

        //Mockery CB is checked
        if (enabledHighlightPopup.indexOf("highlight-mockery") > -1) {
            node
                .filter(function (d) {
                    return !d.mockery;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.mockery;
                })
                .style("opacity", opacityValuePopup);
        }
        //Intolerance CB is checked
        if (enabledHighlightPopup.indexOf("highlight-intolerance") > -1) {
            node
                .filter(function (d) {
                    return !d.intolerance;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.intolerance;
                })
                .style("opacity", opacityValuePopup);
        }
        //Improper language CB is checked
        if (enabledHighlightPopup.indexOf("highlight-improper-language") > -1) {
            node
                .filter(function (d) {
                    return !d.improper_language;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.improper_language;
                })
                .style("opacity", opacityValuePopup);
        }

        //Insult language CB is checked
        if (enabledHighlightPopup.indexOf("highlight-insult") > -1) {
            node
                .filter(function (d) {
                    return !d.insult;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.insult;
                })
                .style("opacity", opacityValuePopup);
        }

        //Aggressiveness language CB is checked
        if (enabledHighlightPopup.indexOf("highlight-aggressiveness") > -1) {
            node
                .filter(function (d) {
                    return !d.aggressiveness;
                })
                .style("opacity", opacityValuePopup);

            link
                .filter(function (d) {
                    return !d.target.aggressiveness;
                })
                .style("opacity", opacityValuePopup);
        }
    }

    function highlightNodesByPropertyOR(node, link) {
        if (enabledHighlightPopup.length === 0) {
            //If no tag (toxicity, stance,...) checkbox is selected: highlight all
            nodesPopup.forEach(function (d) {
                d.highlighted = 1;
            });
            node.style("opacity", 1);
        } else {
            //If some tag checkbox is selected behave as expected
            //First, unhighlight everything and set the parameter highlighted to 0
            nodesPopup.forEach(function (d) {
                d.highlighted = 0;
            });
            node.style("opacity", opacityValuePopup);

            //Then highlight by property OR
            highlightToxicityORPopup(node, enabledHighlightPopup);
            highlightStanceORPopup(node, enabledHighlightPopup);
            highlightTargetORPopup(node, enabledHighlightPopup);
            highlightPositiveORPopup(node, enabledHighlightPopup);
            highlightNegativeORPopup(node, enabledHighlightPopup);
        }

        // If any stance checkboxes are checked, highlight the link from which it originates
        if (enabledHighlightPopup.indexOf("highlight-stance-negative") > -1 ||
            enabledHighlightPopup.indexOf("highlight-stance-positive") > -1 ||
            enabledHighlightPopup.indexOf("highlight-stance-neutral") > -1) {
            link.style("opacity", function (d) {
                return d.target.highlighted ? 1 : opacityValuePopup;
            });
        } else {
            //Highlight only the edges whose both endpoints are highlighted
            link.style("opacity", function (d) {
                return d.source.highlighted && d.target.highlighted ? 1 : opacityValuePopup;
            });
        }
    }

    function highlightNodesByPropertyAND(node, link) {
        nodesPopup.forEach(function (d) {
            d.highlighted = 1;
        });
        node.style("opacity", 1);

        //Then unhighlight by property AND
        highlightToxicityANDPopup(node, enabledHighlightPopup);
        highlightStanceANDPopup(node, enabledHighlightPopup);
        highlightTargetANDPopup(node, enabledHighlightPopup);
        highlightPositiveANDPopup(node, enabledHighlightPopup);
        highlightNegativeANDPopup(node, enabledHighlightPopup);


        // If any stance checkboxes are checked, highlight the link from which it originates
        if (enabledHighlightPopup.indexOf("highlight-stance-negative") > -1 ||
            enabledHighlightPopup.indexOf("highlight-stance-positive") > -1 ||
            enabledHighlightPopup.indexOf("highlight-stance-neutral") > -1) {
            link.style("opacity", function (d) {
                return d.target.highlighted ? 1 : opacityValuePopup;
            });
        } else {
            //Highlight only the edges whose both endpoints are highlighted
            link.style("opacity", function (d) {
                return d.source.highlighted && d.target.highlighted ? 1 : opacityValuePopup;
            });
        }
    }

    function highlightLongestThread(node, link) {
        nodesPopup.forEach(function (d) {
            d.highlighted = 0;
        });
        node.style("opacity", opacityValuePopup);

        node.filter(function (d) {
            if (deepestNodesPathPopup.includes(d)) d.highlighted = 1;
            //console.log(d);
            return (deepestNodesPathPopup.includes(d));
        }).style("opacity", 1);

        //Highlight only the edges whose both endpoints are highlighted
        link.style("opacity", function (d) {
            return d.source.highlighted && d.target.highlighted ? 1 : opacityValuePopup;
        });
    }

    function highlightWidestLevels(node, link, levelsIndexes) {
        nodesPopup.forEach(function (d) {
            d.highlighted = 0;
        });
        node.style("opacity", opacityValuePopup);

        node.filter(function (d) {
            if (levelsIndexes.includes(d.depth)) d.highlighted = 1;
            //console.log(d);
            return (levelsIndexes.includes(d.depth));
        }).style("opacity", 1);

        //Highlight only the edges whose both endpoints are highlighted
        link.style("opacity", function (d) {
            return d.source.highlighted && d.target.highlighted ? 1 : opacityValuePopup;
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
        tooltipTextPopup = "<table>";

        for (i = 0; i < jsonValues.length; i++) {
            if (i === 3 || i === 12) tooltipTextPopup += "<tr><td></td></tr>"; // I want a break between the first line and the features and the targets
            if (i % 3 === 0) tooltipTextPopup += "<tr>"; //Start table line
            if (i < 3)
                tooltipTextPopup +=
                    "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>";
            //First ones without bold
            else if (jsonValues[i] !== -1)
                jsonValues[i] ?
                    (tooltipTextPopup +=
                        "<td><b>" +
                        jsonNames[i] +
                        ": " +
                        jsonValues[i] +
                        "</b></td>") :
                    (tooltipTextPopup +=
                        "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>");
            if ((i + 1) % 3 === 0) tooltipTextPopup += "</tr>"; //End table line
        }
        tooltipTextPopup += "</table>";
        tooltipTextPopup += "<br> <table>";

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
                if (i % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
                tooltipTextPopup +=
                    "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                if ((i + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
            }
        }
        tooltipTextPopup += "</table>";
        tooltipTextPopup += "<br>" + d.coment;


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
        tooltipTextPopup = "<table>";
        tooltipTextPopup += "<br> <table>";

        for (iPopup = 0; iPopup < sonValues.length; iPopup++) {
            if (iPopup % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
            tooltipTextPopup +=
                "<td>" + sonTitles[iPopup] + ": " + sonValues[iPopup] + "</td>";
            if ((iPopup + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
        }
        tooltipTextPopup += "</table>";
        tooltipTextPopup += "<br> <table>";
    }


    function updatePopup(source, first_call) {
        treePopup = treePopup
            .nodeSize([separationHeightPopup, 0]) //heigth and width of the rectangles that define the node space
            .separation(function (a, b) {
                //Compute the radius of the node for the first visualization of the graph
                if (a.radius === undefined) a.radius = computeNodeRadiusPopup(a);
                if (b.radius === undefined) b.radius = computeNodeRadiusPopup(b);

                return Math.ceil((a.radius + b.radius) / separationHeightPopup) + 0.5;
            });

        // Compute the new tree layout.
        nodesPopup = treePopup.nodes(rootPopup).reverse();
        //nodes = tree.nodes(root);
        var links = treePopup.links(nodesPopup);

        // Set widths between levels based on edgeLength.
        nodesPopup.forEach(function (d) {
            d.y = d.depth * edgeLengthPopup;
        });

        // Update the nodes…
        var node = svgGroupPopup.selectAll("g.node").data(nodesPopup, function (d) {
            return d.id || (d.id = ++iPopup);
        });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on("click", function (d) {
                click(d, nodeEnter);
            })
            .on("mouseover", function (d) {
                var highlighted_nodes = node.filter(function (n) {
                    return n.highlighted;
                })[0].map(i => i.__data__.name); // don't ask..
                if (d !== rootPopup && highlighted_nodes.includes(d.name)) {
                    writeTooltipText(d);
                    tooltipPopup.style("visibility", "visible").html(tooltipTextPopup);
                }
                else if(d == rootPopup){
                    writeTooltipRoot(d);
                    tooltipPopup.style("visibility", "visible").html(tooltipTextPopup);
                }
            })
            .on("mousemove", function (d) {
                // if (d !== root) {
                    return tooltipPopup.style("top", (d3.mouse(document.querySelector(".overlay-popup"))[1] - 30) + "px").style("left", (d3.mouse(document.querySelector(".overlay-popup"))[0] - 460) + "px");
                // }
            })
            .on("mouseout", function () {
                return tooltipPopup.style("visibility", "hidden");
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
            .style("stroke-width", getNodeStrokeWidthPopup());


        dotsFeaturesPopup.addEventListener("click", function () {
            selectFeatureVisualization(nodeEnter);
        });

        glyphsFeaturesPopup.addEventListener("click", function () {
            selectFeatureVisualization(nodeEnter);
        });

        /*SECTION checkboxes listener*/

        dotsFeaturesPopup.addEventListener("change", function () {
            selectFeatureVisualization(nodeEnter);
        });

        glyphsFeaturesPopup.addEventListener("change", function () {
            selectFeatureVisualization(nodeEnter);
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

                checkboxesTargetsPopup.forEach(function (checkboxItem) {
                    enabledTargetsPopup =
                        Array.from(checkboxesTargetsPopup) // Convert checkboxes to an array to use filter and map.
                            .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                            .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                    selectTargetVisualization(nodeEnter);
                });

                checkboxesPopup.forEach(function (checkboxItem) {
                    enabledFeaturesPopup =
                        Array.from(checkboxesPopup) // Convert checkboxes to an array to use filter and map.
                            .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                            .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                    selectFeatureVisualization(nodeEnter);
                });


                /*SECTION checkboxes listener*/

                // Use Array.forEach to add an event listener to each checkbox.
                // Draw target images
                checkboxesTargetsPopup.forEach(function (checkboxItem) {

                    checkboxItem.addEventListener('change', function () {
                        enabledTargetsPopup =
                            Array.from(checkboxesTargetsPopup) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, "| [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, "| [Date]", Date.now());
                        }
                        selectTargetVisualization(nodeEnter);
                    })
                });

                checkboxesPopup.forEach(function (checkboxItem) {
                    checkboxItem.addEventListener('change', function () {
                        enabledFeaturesPopup =
                            Array.from(checkboxesPopup) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, "| [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        }
                        selectFeatureVisualization(nodeEnter);
                    })
                });

                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupORPopup.forEach(function (checkboxItem) {
                    checkboxItem.addEventListener('change', function () {
                        enabledHighlightPopup =
                            Array.from(checkboxesHighlightGroupORPopup) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                        var filteredOriginalToxicity = getLengthFilterByName(Array.from(checkboxesHighlightGroupORPopup).map(i => i.value), "highlight-toxicity-");
                        var filteredCompareToxicity = getLengthFilterByName(Array.from(enabledHighlightPopup), "highlight-toxicity-");
                        document.getElementById('highlight-OR-selectAll-toxicity').checked = filteredOriginalToxicity === filteredCompareToxicity;

                        var filteredOriginalStance = getLengthFilterByName(Array.from(checkboxesHighlightGroupORPopup).map(i => i.value), "highlight-stance-");
                        var filteredCompareStance = getLengthFilterByName(Array.from(enabledHighlightPopup), "highlight-stance-");
                        document.getElementById('highlight-OR-selectAll-stance').checked = filteredOriginalStance === filteredCompareStance;

                        var filteredOriginalTarget = getLengthFilterByName(Array.from(checkboxesHighlightGroupORPopup).map(i => i.value), "highlight-target-");
                        var filteredCompareTarget = getLengthFilterByName(Array.from(enabledHighlightPopup), "highlight-target-");
                        document.getElementById('highlight-OR-selectAll-target').checked = filteredOriginalTarget === filteredCompareTarget;

                        var filteredOriginalFeatures = getLengthFilterByName(Array.from(checkboxesHighlightGroupORPopup).map(i => i.value), "highlight-features-");
                        var filteredCompareFeatures = getLengthFilterByName(Array.from(enabledHighlightPopup), "highlight-features-");
                        document.getElementById('highlight-OR-selectAll-features').checked = filteredOriginalFeatures === filteredCompareFeatures;


                        //console.log(enabledHighlight);
                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        }
                        checkboxORPopup.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
                    })
                });

                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupANDPopup.forEach(function (checkboxItem) {
                    checkboxItem.addEventListener('change', function () {
                        enabledHighlightPopup =
                            Array.from(checkboxesHighlightGroupANDPopup) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.


                        var filteredOriginalTarget = getLengthFilterByName(Array.from(checkboxesHighlightGroupANDPopup).map(i => i.value), "highlight-target-");
                        var filteredCompareTarget = getLengthFilterByName(Array.from(enabledHighlightPopup), "highlight-target-");
                        document.getElementById('highlight-AND-selectAll-target').checked = filteredOriginalTarget === filteredCompareTarget;

                        var filteredOriginalFeatures = getLengthFilterByName(Array.from(checkboxesHighlightGroupANDPopup).map(i => i.value), "highlight-features-");
                        var filteredCompareFeatures = getLengthFilterByName(Array.from(enabledHighlightPopup), "highlight-features-");
                        document.getElementById('highlight-AND-selectAll-features').checked = filteredOriginalFeatures === filteredCompareFeatures;


                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        }
                        checkboxANDPopup.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
                    })
                });

                // To notify the DOM that the ready function has finished executing.
                // This to be able to manage the filters if it is given the case that the code of the onLoad function finishes before.
                const event = new Event('codeReadyPopup');

                // Dispatch the event.
                document.querySelector("body").dispatchEvent(event);

                codeReadyPopup = true;
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
        $(popup_container).off("longest_thread");
        $(popup_container).on("longest_thread", function () {
            console.log("iiiiiiiiiiiii")
            let deepestNodes = getDeepestNodes(rootPopup);

            deepestNodesPathPopup = getDeepestNodesPath(rootPopup, deepestNodes);
            // document.getElementById("jsConnector").innerHTML = ["longest_thread", deepestNodes.length, deepestNodes[0].depth].toString();
            highlightLongestThread(node, link);
        });

        /**
         * Obtains the indices of the widest levels of the graph, highlights the nodes that belong to those levels,
         * updates the network statistics, and displays the result in the chat
         */
        $(popup_container).off("widest_level");
        $(popup_container).on("widest_level", function () {
            let widestLevels = getWidestLevels(rootPopup, getTreeHeight(rootPopup));

            highlightWidestLevels(node, link, widestLevels[0]);
        });

        checkboxANDPopup.addEventListener("change", function () {
            if (this.checked) {
                checkboxORPopup.checked = false;

                enabledHighlightPopup =
                    Array.from(checkboxesHighlightGroupANDPopup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                highlightNodesByPropertyAND(node, link);
            } else {
                checkboxORPopup.checked = true;
                enabledHighlightPopup =
                    Array.from(checkboxesHighlightGroupORPopup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                highlightNodesByPropertyOR(node, link);
            }
        });
        // If OR is selected, uncheck the AND and highlight by property OR
        checkboxORPopup.addEventListener("change", function () {
            if (this.checked) {
                checkboxANDPopup.checked = false;

                enabledHighlightPopup =
                    Array.from(checkboxesHighlightGroupORPopup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                highlightNodesByPropertyOR(node, link);
            } else {
                checkboxANDPopup.checked = true;
                enabledHighlightPopup =
                    Array.from(checkboxesHighlightGroupANDPopup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                highlightNodesByPropertyAND(node, link);
            }
        });

        if (!first_call) {
            checkboxesTargetsPopup.forEach(function (checkboxItem) {
                enabledTargetsPopup =
                    Array.from(checkboxesTargetsPopup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectTargetVisualization(nodeEnter);
            });

            checkboxesPopup.forEach(function (checkboxItem) {
                enabledFeaturesPopup =
                    Array.from(checkboxesPopup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectFeatureVisualization(nodeEnter);
            });
        }

        //Enable checkboxes and dropdown menu + show features if they are selected
        checkboxesPropertyFeaturePopup.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute("disabled");
        });
        checkboxesPositioningFeaturePopup.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute("disabled");
        });
        checkboxesPopup.forEach(function (checkboxItem) {
            checkboxItem.removeAttribute("disabled");
        });
        // dropdownFeatures.removeAttribute("disabled");

        checkButtonsPopup.forEach(function (button) {
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
                return computeNodeRadiusPopup(d);
            })
            .style("fill", function (d) {
                if (d._children && d._children.length === 1)
                    return colourCollapsed1SonPopup;
                //If it is collapsed and just has one children
                else {
                    //Otherwise, colour the node according to its level of toxicity
                    switch (d.toxicity_level) {
                        case 0:
                            return colourToxicity0Popup;
                        case 1:
                            return colourToxicity1Popup;
                        case 2:
                            return colourToxicity2Popup;
                        case 3:
                            return colourToxicity3Popup;
                        default:
                            return colourNewsArticlePopup;
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
            .duration(durationPopup)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text").style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node
            .exit()
            .transition()
            .duration(durationPopup)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle").attr("r", 0);

        nodeExit.select("text").style("fill-opacity", 0);

        // Update the links…
        var link = svgGroupPopup.selectAll("path.link").data(links, function (d) {
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
                return diagonalPopup({
                    source: o,
                    target: o,
                });
            })
            .style("stroke", function (d) {
                if (d.target.positive_stance && d.target.negative_stance)
                    return colourBothStancesPopup;
                //Both against and in favour
                else if (d.target.positive_stance === 1)
                    return colourPositiveStancePopup;
                //In favour
                else if (d.target.negative_stance === 1)
                    return colourNegativeStancePopup;
                //Against
                else return colourNeutralStancePopup; //Neutral comment
            })
            .on("click", clickLink);

        // Transition links to their new position.
        link.transition().duration(durationPopup).attr("d", diagonalPopup);

        checkboxANDPopup.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);

        // Transition exiting nodes to the parent's new position.
        link
            .exit()
            .transition()
            .duration(durationPopup)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y,
                };
                return diagonalPopup({
                    source: o,
                    target: o,
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodesPopup.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }


    // Append a group which holds all nodes and which the zoom Listener can act upon.

    // Define the root position
    rootPopup.x0 = viewerHeightPopup / 2;
    rootPopup.y0 = 0;

    // Layout the tree initially and center on the root node.
    updatePopup(rootPopup, true);
    centerNodePopup(rootPopup);

    var boxPopup = computeDimensionsPopup(nodesPopup);
    var initialSightPopup = zoomToFitGraphPopup(boxPopup.minX, boxPopup.minY, boxPopup.maxX, boxPopup.maxY, rootPopup, 277, 498);
    initialZoomPopup = initialSightPopup.initialZoom;
    initialXPopup = initialSightPopup.initialX;
    initialYPopup = initialSightPopup.initialY;


    $(document.body).on("initPopup", initPositionTreePopup);

    function initPositionTreePopup() {
        zoomListenerPopup.scale(initialZoomPopup);
        zoomListenerPopup.translate([initialYPopup, initialXPopup]);
        zoomListenerPopup.event(baseSvgPopup);
    };
    initPositionTreePopup()
    
    //I compute the values for the statistic data showing in the background
    var listStatistics = getStatisticValues(rootPopup);
    var totalNumberOfNodes = listStatistics.children;

    var totalNotToxic = listStatistics.toxicity0,
        totalMildlyToxic = listStatistics.toxicity1,
        totalToxic = listStatistics.toxicity2,
        totalVeryToxic = listStatistics.toxicity3;

    var totalGroup = listStatistics.totalTargGroup,
        totalPerson = listStatistics.totalTargPerson,
        totalStereotype = listStatistics.totalTargStereotype,
        totalNone = listStatistics.totalTargNone;

    function drawZoomValue(zoomLevel) {
        // console.log("Zoom Level", zoomLevel);
        //try {
        //zoomLabel.textContent = "Zoom: " + ((((zoomLevel - 0.1) / 2.9) * 100).toFixed(0) - 1) + '%';
        //XLabel.textContent = "X: " + currentX.toFixed(0);
        //YLabel.textContent = "Y: " + currentY.toFixed(0);
        //} catch (TypeError) {
        //    XLabel.textContent = "X: " + currentX;
        //    YLabel.textContent = "Y: " + currentY;
        //}
    }

    console.log('[User]', user.split('/')[2], '| [interaction]', 'Tree_layout_loaded', ' | [Date]', Date.now());
    //window.addEventListener('DOMContentLoaded', (event) => {
    //drawZoomValue(zoomListener.scale());
    //screenshotButton.addEventListener('click', function () {
    // var ctx = canvas.getContext('2d');
    // var data = (new XMLSerializer()).serializeToString(baseSvg.node());
    // var DOMURL = window.URL || window.webkitURL || window;

    // var img = new Image();
    // var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    // var url = DOMURL.createObjectURL(svgBlob);

    // img.onload = function () {
    //     ctx.drawImage(img, 0, 0);
    //     DOMURL.revokeObjectURL(url);

    //     var imgURI = canvas
    //         .toDataURL('image/png')
    //         .replace('image/png', 'image/octet-stream');

    //     triggerDownload(imgURI);
    // };

    // img.src = url;
    //console.log(baseSvg);
    //    saveSvgAsPng(baseSvg.node(), "tree_image.png");
    //});
    //});


    // import saveSvgAsPng from './saveSvgAsPng.js';

    var screenshotButton = document.getElementById("screenshot_icon");
    var canvas = document.getElementById("screenshot_canvas");

    function triggerDownload(imgURI) {
        var evt = new MouseEvent('click', {
            view: window,
            bubbles: false,
            cancelable: true
        });

        var a = document.createElement('a');
        a.setAttribute('download', 'tree_image.png');
        a.setAttribute('href', imgURI);
        a.setAttribute('target', '_blank');

        a.dispatchEvent(evt);
    }


    // function saveSvg(svgEl, name) {
    //     //svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    //     var svgData = svgEl.outerHTML;
    //     var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    //     var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    //     var svgUrl = URL.createObjectURL(svgBlob);
    //     var downloadLink = document.createElement("a");
    //     downloadLink.href = svgUrl;
    //     downloadLink.download = name;
    //     document.body.appendChild(downloadLink);
    //     downloadLink.click();
    //     document.body.removeChild(downloadLink);
    // }

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
        if (node == rootPopup) { return true; } //ignore root case
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
        for (iPopup = 0; iPopup < nodeList.length; iPopup++) {
            aux += nodeList[iPopup];
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
});

/*******************************
*           Force              *
********************************/

$(".force-modal-button").on("click", function () {
    document.querySelector(".modal-body .my-tooltip").remove()
    document.querySelector(".modal-body .overlay-popup").remove()
    // Variable to check if the ready function code has been completely executed
    var codeReady = false;

    //Graph
    var canvasHeight = 1000, canvasWidth = 2200; //Dimensions of our canvas (grayish area)
    const canvasFactor = 1;
    let link, node;

    //Zoom
    const minZoom = 0.05, maxZoom = 8; //Zoom range
    let currentZoomScale; //Current scale
    const initialZoomScale = 1; //Initial zoom scale to display almost the whole graph


    //Node radius
    const minNodeRadius = 30;
    const incrementRadiusFactorPerChild = 5;
    const dotRadius = 15;

    const colourToxicity0 = "#FAFFA8", colourToxicity1 = "#F8BB7C", colourToxicity2 = "#F87A54",
        colourToxicity3 = "#7A1616", colourNewsArticle = "lightsteelblue";

    const colourConstructiveness = "#90F6B2", colourArgumentation = "#1B8055", colourSarcasm = "#97CFFF",
        colourMockery = "#1795FF",
        colourIntolerance = "#0B5696", colourImproper = "#E3B7E8", colourInsult = "#A313B3",
        colourAggressiveness = "#5E1566";


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
        if (d.parent === undefined && d.radius > edgeLength / 2) d.radius = edgeLength / 2.0;
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
            drawZoomValue(newScale);
            currentScale = newScale;

        }

        let zoomListener = d3.behavior.zoom().scaleExtent([minZoom, maxZoom]).on("zoom", function () {
            currentZoomScale = d3.event.scale
            link.style("stroke-width", getEdgeStrokeWidth()); //Enlarge stroke-width on zoom out
            node.select("circle").style("stroke-width", getNodeStrokeWidth()); //Enlarge stroke-width on zoom out
            zoom();
        });


        /* Colours
        * */
        var colourBothStances = "#FFA500", colourPositiveStance = "#77dd77", colourNegativeStance = "#ff6961",
            colourNeutralStance = "#2b2727";


        var colourToxicity0 = "#f7f7f7", colourToxicity1 = "#cccccc", colourToxicity2 = "#737373",
            colourToxicity3 = "#000000", colourNewsArticle = "lightsteelblue", colourCollapsed = "Blue";

        var colorFeature = ["#1B8055", "#90F6B2",
            "#97CFFF", "#1795FF", "#0B5696",
            "#E3B7E8", "#A313B3", "#5E1566"
        ];

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
        var tooltip = d3.select(popup_container)
            .append("div")
            .attr("class", "my-tooltip") //add the tooltip class
            .style("position", "absolute")
            .style("z-index", "60")
            .style("visibility", "hidden");


        var svg = d3.select(popup_container) //Define the container that holds the layout
            .append("svg")
            .attr("width", canvasWidth)
            .attr("height", canvasHeight)
            .attr("class", "overlay-popup")
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
                        if (d.parent === null) {
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
                            if (d.parent === null) return 0;
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
                            if (d.parent === null) return 0;
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
                            if (d.parent === null) return 0;
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
                        if (d.parent === null) {
                            return false;
                        } else {
                            listOpacity = [d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
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
                    if (d.parent === null) return 0;
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
                        if (d.parent === null) {
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
                            if (d.parent === null) return 0;

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
                            if (d.parent === null) return 0;

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
                            if (d.parent === null) {
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
                return d.parent === null;
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
                    return (d.source.highlighted && d.target.highlighted) || (d.source.parent === null && d.target.highlighted) ? 1 : opacityValue;
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
                    return (d.source.highlighted && d.target.highlighted) || (d.source.parent === null && d.target.highlighted) ? 1 : opacityValue;
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
                //console.log(d);
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

        function writeTooltipText(d) {

            //I want to show Argument and Constructiveness in one line, I add a dummy space to keep that in the loop
            var jsonValues = [d.name, d.toxicity_level, d.depth,
                d.argumentation, d.constructiveness, -1,
                d.sarcasm, d.mockery, d.intolerance,
                d.improper_language, d.insult, d.aggressiveness,
                d.target_group, d.target_person, d.stereotype];
            var jsonNames = ["Comment ID", "Toxicity level", "Comment depth",
                "Argument", "Constructiveness", " ",
                "Sarcasm", "Mockery", "Intolerance",
                "Improper language", "Insult", "Aggressiveness",
                "Target group", "Target person", "Stereotype"];
            var i = 0;
            tooltipText = "<table>";

            for (i = 0; i < jsonValues.length; i++) {
                if (i === 3 || i === 12) tooltipText += "<tr><td></td></tr>"; // I want a break between the first line and the features and the targets
                if (i % 3 === 0) tooltipText += "<tr>"; //Start table line
                if (i < 3) tooltipText += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>"; //First ones without bold
                else if (jsonValues[i] !== -1) jsonValues[i] ? tooltipText += "<td><b>" + jsonNames[i] + ": " + jsonValues[i] + "</b></td>" : tooltipText += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>";
                if ((i + 1) % 3 === 0) tooltipText += "</tr>"; //End table line
            }

            tooltipText += "</table>";

            tooltipText += "<br> <table>";
            //If node is collapsed, we also want to add some information about its sons
            if (d._children) {
                var sonTitles = ["Direct comments", "Total number of generated comments", "Not toxic", "Mildly toxic", "Toxic", "Very toxic"];
                var sonValues = [d._children.length, d.numberOfDescendants, d.descendantsWithToxicity0, d.descendantsWithToxicity1, d.descendantsWithToxicity2, d.descendantsWithToxicity3];

                for (i = 0; i < sonValues.length; i++) {
                    if (i % 2 === 0) tooltipText += "<tr>"; //Start table line
                    tooltipText += "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                    if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
                }

            }
            tooltipText += "</table>";
            tooltipText += "<br>" + d.coment;
        }

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
                tooltipText = "<table>";
                tooltipText += "<br> <table>";

                for (i = 0; i < sonValues.length; i++) {
                    if (i % 2 === 0) tooltipText += "<tr>"; //Start table line
                    tooltipText +=
                        "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                    if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
                }

          tooltipText += "</table>";


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

        document.querySelector("#tree-container div.my-statistic").style.visibility = "hidden";
        var static_values_checked = document.querySelector("#tree-container div.my-statistic").style.visibility === "visible";
        jQuery("#static_values_button").click(function () {
            if (!static_values_checked) {
                document.getElementById('static_values_button').innerHTML = '&#8722;';
                static_values_checked = true;
                console.log('[User]', user.split('/')[2], '| [interaction]', 'show_summary', ' | [Date]', Date.now());

            } else {
                document.getElementById('static_values_button').innerHTML = '&#43;'
                static_values_checked = false;
                console.log('[User]', user.split('/')[2], '| [interaction]', 'hide_summary', ' | [Date]', Date.now());

            }
        });

        try {
            $(document).ready(function () {
                checkboxesTargets.forEach(function (checkboxItem) {
                    checkboxItem.addEventListener('change', function () {
                        enabledTargets =
                            Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        }
                        selectTargetVisualization(node);
                    })
                });

                // Use Array.forEach to add an event listener to each checkbox.
                // Draw feature circles
                checkboxes.forEach(function (checkboxItem) {
                    checkboxItem.addEventListener('change', function () {
                        enabledFeatures =
                            Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                                .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        }
                        selectFeatureVisualization(node);

                    })
                });


    // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupOR.forEach(function (checkboxItem) {
                    checkboxItem.addEventListener('change', function () {
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
                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        }
                        checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
                    })
                });

                // Use Array.forEach to add an event listener to each checkbox.
                checkboxesHighlightGroupAND.forEach(function (checkboxItem) {
                    checkboxItem.addEventListener('change', function () {
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

                        if (checkboxItem.checked) {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        } else {
                            console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                        }
                        checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
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
        $(popup_container).off("longest_thread");
        $(popup_container).on("longest_thread", function () {
            let deepestNodes = getDeepestNodes(root);

            deepestNodesPath = getDeepestNodesPath(root, deepestNodes);
            // document.getElementById("jsConnector").innerHTML = ["longest_thread", deepestNodes.length, deepestNodes[0].depth].toString();
            highlightLongestThread(node, link);
        });

        /**
         * Obtains the indices of the widest levels of the graph, highlights the nodes that belong to those levels,
         * updates the network statistics, and displays the result in the chat
         */
        $(document.body).off("widest_level");
        $(document.body).on("widest_level", function () {
            let widestLevels = getWidestLevels(root, getTreeHeight(root));

            highlightWidestLevels(node, link, widestLevels[0]);
        });

        /*
        Functions
        * */
        function update() {
            nodes = flatten(root); //get nodes as a list
            var links = d3.layout.tree().links(nodes);

            optimalK = getOptimalK(nodes); // compute optimal distance between nodes

            root.fixed = true;
            root.x = canvasWidth / 2;
            root.y = canvasHeight / 2;

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
            var container = node.enter().append("g")
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
                        writeTooltipText(d);
                        tooltip.style("visibility", "visible")
                            .html(tooltipText);
                    }
                    else if(d == root){
                        writeTooltipRoot(d);
                        tooltip.style("visibility", "visible").html(tooltipText);
                    }
                })
                .on("mousemove", function (d) {
                    // if (d !== root) {
                        return tooltip.style("top", (d3.mouse(document.querySelector(".overlay-popup"))[1] - 30) + "px").style("left", (d3.mouse(document.querySelector(".overlay-popup"))[0] - 440) + "px");
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

            container.append("circle")
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

            dotsFeatures.addEventListener("change", function () {
                selectFeatureVisualization(node);
            });

            glyphsFeatures.addEventListener("change", function () {
                selectFeatureVisualization(node);
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

            // If AND is selected, uncheck the OR and highlight by property AND
            checkboxAND.addEventListener("change", function () {
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
            checkboxOR.addEventListener("change", function () {
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
            drawZoomValue(zoom.scale);
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
            update();
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

        update();

        force.alpha(1.5); //Restart the timer of the cooling parameter with a high value to reach better initial positioning

        //Try to center and zoom to fit the first initialization
        let box = computeDimensions(nodes);

        let initialSight = zoomToFitGraph(box.minX, box.minY, box.maxX, box.maxY, root, 277/2, 498/2);

        initialZoom = initialSight.initialZoom;
        initialX = initialSight.initialX;
        initialY = initialSight.initialY;

        zoomListener.scale(initialZoom);
        zoomListener.translate([initialY, initialX]);
        zoomListener.event(svg);

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
            return statisticText;
        }

        function drawZoomValue(zoomLevel) {
            //console.log("Zoom Level", zoomLevel);
            //zoomLabel.textContent = "Zoom: " + ((((zoomLevel - minZoom) / maxZoom) * 100) + 1).toFixed(0) + '%';
            //XLabel.textContent = "X: " + currentX.toFixed(0);
            //>YLabel.textContent = "Y: " + currentY.toFixed(0);
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
})