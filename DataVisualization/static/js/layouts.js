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

/*************************************
*   Popup Categorization Functions   *
**************************************/



/****************************************
*   GLOBAL VARIABLES - TREE/ALL GRAPH   *
*****************************************/

// Variable to check if the ready function code has been completely executed
var codeReadyPopup = false;

//Graph
var viewerWidthPopup = 100;  // size of the diagram
var viewerHeightPopup = 400;

var linkPopup, nodePopup, nodesPopup, rootPopup;
var canvasHeightPopup = document.querySelector(".modal .modal-body").offsetHeight,
    canvasWidthPopup = document.querySelector(".modal .modal-body").offsetWidth; //Dimensions of our canvas (grayish area)
var initialCanvasHeightPopup,
    initialCanvasWidthPopup;

//Zoom
var minZoomPopup, maxZoomPopup; //Zoom range
let currentZoomScalePopup; //Current scale

var initialZoomPopup, initialXPopup, initialYPopup; //Initial zoom and central coordinates of the first visualization of the graph

var separationHeightPopup;

var tooltipTextPopup; // The variable displaying the information of a node inside a floating rectangle

//Node radius
var minNodeRadiusPopup;
var incrementRadiusFactorPerChildPopup;
var dotRadiusPopup;

//Paths
var pathTargetsPopup = pt;

//Colours

var colourBothStancesPopup = "#FFA500", colourPositiveStancePopup = "#77dd77", colourNegativeStancePopup = "#ff6961",
    colourNeutralStancePopup = "#2b2727";


var colourToxicity0Popup = "#f7f7f7", colourToxicity1Popup = "#cccccc", colourToxicity2Popup = "#737373",
    colourToxicity3Popup = "#000000", colourNewsArticlePopup = "lightsteelblue", colourCollapsed1SonPopup = "lightsteelblue";

var colorFeaturePopup = ["#1B8055","#90F6B2",
    "#97CFFF", "#1795FF", "#0B5696",
    "#E3B7E8", "#A313B3", "#5E1566"
];

const colourConstructivenessPopup = "#90F6B2", colourArgumentationPopup = "#1B8055", colourSarcasmPopup = "#97CFFF",
    colourMockeryPopup = "#1795FF",
    colourIntolerancePopup = "#0B5696", colourImproperPopup = "#E3B7E8", colourInsultPopup = "#A313B3",
    colourAggressivenessPopup = "#5E1566";

/* Icon for the root node */
var rootPathPopup = pr;
var objRootPopup = {
    class: "rootNode",
    id: "rootNode",
    fileName: "root.png"
};

var imgRatioPopup; //Percentage of difference between the radii of a node and its associated image

var radiusFactorPopup = 2; // The factor by which we multiply the radius of a node when collapsed with more than 2 children
var opacityValuePopup = 0.1; //Opacity when a node or link is not highlighted

/********************************************
*   GLOBAL VARIABLES - FORCE/RADIAL GRAPH   *
*********************************************/

const canvasFactorPopup = 1;

//Zoom
var initialZoomScalePopup; //Initial zoom scale to display almost the whole graph

/********************************************
*   GLOBAL VARIABLES - RADIAL GRAPH   *
*********************************************/

const edgeLengthPopup = 24 * 20;

//Features
const cheeseXPopup = 15, cheeseYPopup = -10, cheeseHeightPopup = 20, cheeseWidthPopup = 20;

//Images
const targetIconHeightPopup = 30, targetIconWidthPopup = 30;

// Objects for target images
const objTargetGroupPopup = {
        class: "targetGroup",
        id: "targetGroup",
        name: "target-group",
        x: -40,
        y: -15,
        xInside: -0.9,
        yInside: -0.8,
        height: targetIconHeightPopup,
        width: targetIconWidthPopup,
        fileName: "Group.svg"
    },
    objTargetPersonPopup = {
        class: "targetPerson",
        id: "targetPerson",
        name: "target-person",
        x: -80,
        y: -15,
        xInside: -0.5,
        yInside: 0,
        height: targetIconHeightPopup,
        width: targetIconWidthPopup,
        fileName: "Person.svg"
    },
    objTargetStereotypePopup = {
        class: "targetStereotype",
        id: "targetStereotype",
        name: "target-stereotype",
        x: -120,
        y: -15,
        xInside: -0.1,
        yInside: -0.8,
        height: targetIconHeightPopup,
        width: targetIconWidthPopup,
        fileName: "Stereotype.svg"
    };

// Objects for feature images
const objFeatArgumentationPopup = {
        class: "featArgumentation",
        id: "featArgumentation",
        name: "argumentation",
        color: colourArgumentationPopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Argumentation.svg"
    },
    objFeatConstructivenessPopup = {
        class: "featConstructiveness",
        id: "featConstructiveness",
        name: "constructiveness",
        color: colourConstructivenessPopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Constructiveness.svg"
    },
    objFeatSarcasmPopup = {
        class: "featSarcasm",
        id: "featSarcasm",
        name: "sarcasm",
        color: colourSarcasmPopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Sarcasm.svg"
    },
    objFeatMockeryPopup = {
        class: "featMockery",
        id: "featMockery",
        name: "mockery",
        color: colourMockeryPopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Mockery.svg"
    },
    objFeatIntolerancePopup = {
        class: "featIntolerance",
        id: "featIntolerance",
        name: "intolerance",
        color: colourIntolerancePopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Intolerance.svg"
    },
    objFeatImproperPopup = {
        class: "featImproper",
        id: "featImproper",
        name: "improper_language",
        color: colourImproperPopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Improper.svg"
    },
    objFeatInsultPopup = {
        class: "featInsult",
        id: "featInsult",
        name: "insult",
        color: colourInsultPopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Insult.svg"
    },
    objFeatAggressivenessPopup = {
        class: "featAggressiveness",
        id: "featAggressiveness",
        name: "aggressiveness",
        color: colourAggressivenessPopup,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Aggressiveness.svg"
    },
    objFeatGrayPopup = {
        class: "featGray",
        id: "featGray",
        name: "gray",
        selected: 1,
        x: cheeseXPopup,
        y: cheeseYPopup,
        height: cheeseHeightPopup,
        width: cheeseWidthPopup,
        fileName: "Gray.png"
    };

/****************************************
*   GLOBAL FUNCTIONS - TREE/ALL GRAPH   *
*****************************************/
/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadiusTree(d, edgeLength = 300) {
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
    *                     | Y negative
    *                     |
    * X negative <--------|-------> X positive
    *                     |
    *                     | Y positive
    * And note we need to take into account the radius of the node
    * */
    let minX = Infinity,
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

function getNodeStrokeWidthTree() {
    return 1.5;
}

/**
 * Set edge stroke width based on current zoom value
 * */
function getEdgeStrokeWidth() {
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

/* SECTION: Draw features*/

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

/** Removes the pngs for the toxicities drawn
 * */
function removeToxicities(nodeEnter) {
    nodeEnter.selectAll("#toxicity0").remove();
    nodeEnter.selectAll("#toxicity1").remove();
    nodeEnter.selectAll("#toxicity2").remove();
    nodeEnter.selectAll("#toxicity3").remove();
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

/*************************************
*   GLOBAL FUNCTIONS - FORCE GRAPH   *
**************************************/

function getNodeStrokeWidthForce() {
    switch (true) {
        case (currentZoomScalePopup > 1):
            return 4
        case (currentZoomScalePopup > 0.6):
            return 4
        case (currentZoomScalePopup > 0.5):
            return 5
        case (currentZoomScalePopup > 0.4):
            return 5
        case (currentZoomScalePopup > 0.3):
            return 6
        case (currentZoomScalePopup > 0.2):
            return 6
        case (currentZoomScalePopup > 0.1):
            return 8
        case (currentZoomScalePopup > 0.075):
            return 8
        case (currentZoomScalePopup > 0):
            return 10
    }
}


/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadiusForce(d, edgeLength = 500) {
    /*
        If node has children,
        more than 2: new radius = 16 + 3 * (#children - 2)
        2 children: new radius = 16
        1 child: new radius = 13
        0 children: new radius = 40
    */

    d.radius = minNodeRadiusPopup;
    if ((d.children === undefined || d.children === null) && (d._children === undefined || d._children === null)) return d.radius; //If no children, radius = 40

    let children = d.children ?? d._children; //Assign children collapsed or not


    children.length > 2 ? d.radius = minNodeRadiusPopup + incrementRadiusFactorPerChildPopup * children.length // more than 2 children
        : children.length === 2 ? d.radius = minNodeRadiusPopup + incrementRadiusFactorPerChildPopup * 2 //2 children
            : d.radius = minNodeRadiusPopup + incrementRadiusFactorPerChildPopup; //One child
    //Avoid the root node from being so large that overlaps/hides its children
    if (d.parent === undefined && d.radius > edgeLength / 2) d.radius = edgeLength / 2.0;
    return Math.min(d.radius, 300);
}

/**
 * Returns a list of all nodes under the root.
 * */
function flatten(root) {
    var nodesList = [], i = 0;

    function recurse(node, parent) {
        node.parent = parent; //We assign a parent to the node
        if (parent) node.depth = node.parent.depth + 1; //If parent is not null
        if (node.children) node.children.forEach(element => recurse(element, node));
        if (!node.id) node.id = ++i;
        nodesList.push(node);
    }

    root.depth = 0;
    recurse(root, null);
    return nodesList;
}

/**************************************
*   GLOBAL FUNCTIONS - RADIAL GRAPH   *
***************************************/

/**
 * Computes the borders of a box containing our nodes
 * */
function computeDimensionsRadial(nodes) {
    /* Note our coordinate system:
    * in radian coordinates
    * q4    |       q1
    * ------|---------
    * q3    |       q2
    * */
    var maxYq1 = -Infinity, maxYq2 = -Infinity, maxYq3 = -Infinity, maxYq4 = -Infinity;
    var xQ1, xQ2, xQ3, xQ4;

    for (const n of nodes) {
        //Quadrant 1
        if (0 <= n.x && n.x < 90 && n.y > maxYq1) {
            maxYq1 = n.y;
            xQ1 = n.x;
        }

        //Quadrant 2
        if (90 <= n.x && n.x < 180 && n.y > maxYq2) {
            maxYq2 = n.y;
            xQ2 = n.x;
        }
        if (-270 <= n.x && n.x < -180 && n.y > maxYq2) {
            maxYq2 = n.y;
            xQ2 = n.x;
        }

        //Quadrant 3
        if (180 <= n.x && n.x < 270 && n.y > maxYq3) {
            maxYq3 = n.y;
            xQ3 = n.x;
        }
        if (-180 <= n.x && n.x < -90 && n.y > maxYq3) {
            maxYq3 = n.y;
            xQ3 = n.x;
        }

        //Quadrant 4
        if (-90 <= n.x && n.x < 0 && n.y > maxYq4) {
            maxYq4 = n.y;
            xQ4 = n.x;
        }
    }
    return {
        maxYq1: maxYq1, maxYq2: maxYq2, maxYq3: maxYq3, maxYq4: maxYq4,
        xQ1: xQ1, xQ2: xQ2, xQ3: xQ3, xQ4: xQ4
    };
}

/**
 * Center graph and zoom to fit the whole graph visualization in our canvas
 * */
function zoomToFitGraphRadial(minX, minY, maxX, maxY,
                              root,
                              canvasHeight = 1000 * canvasFactorPopup, canvasWidth = 2200 * canvasFactorPopup,
                              duration = 750) {
    /* Note our coordinate system:
    *
    *
    *                     | Y negative
    *                     |
    * X negative <--------|-------> X positive
    *                     |
    *                     | Y positive
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

    /*
    if(canvasWidth/boxWidth < canvasHeight/boxHeight) {
        newY -= midX * scale;
        //newX -= midY * scale;
    }
    else newX -= midY * scale;
    */


    //For nodes wider than tall, we need to displace them to the middle of the graph
    //if(newY < boxHeight*scale && boxHeight*scale < canvasHeight) newY =  canvasHeight / 2.0;

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
 * Return the value of a property (set from the JSON) of the given node
 *
 * @param d Datum of a node
 * @param {string} propertyNameToRetrieve The property whose value is returned
 * */
function retrieveAttributeFromCommentRadial(d, propertyNameToRetrieve) {
    switch (propertyNameToRetrieve) {
        //Features
        case "argumentation":
            return d.argumentation;
        case "constructiveness":
            return d.constructiveness;
        case "sarcasm":
            return d.sarcasm;
        case "mockery":
            return d.mockery;
        case "intolerance":
            return d.intolerance;
        case "improper_language":
            return d.improper_language;
        case "insult":
            return d.insult;
        case "aggressiveness":
            return d.aggressiveness;
        case "gray":
            return 1;
        case "gray-ring":
            return 0.5;

        //Targets
        case "target-group":
            return d.target_group;
        case "target-person":
            return d.target_person;
        case "target-stereotype":
            return d.stereotype;

        //Toxicity
        case "toxicity-0":
            return d.toxicity_level === 0 ? 1 : 0;
        case "toxicity-1":
            return d.toxicity_level === 1 ? 1 : 0;
        case "toxicity-2":
            return d.toxicity_level === 2 ? 1 : 0;
        case "toxicity-3":
            return d.toxicity_level === 3 ? 1 : 0;

        default:
            //console.log("An attribute could not be retrieved because the key word did not match any case...");
            break;
    }
}

function getNodeStrokeWidthRadial() {
    switch (true) {
        case (currentZoomScalePopup > 1):
            return 1
        case (currentZoomScalePopup > 0.6):
            return 2
        case (currentZoomScalePopup > 0.5):
            return 3
        case (currentZoomScalePopup > 0.4):
            return 4
        case (currentZoomScalePopup > 0.3):
            return 5
        case (currentZoomScalePopup > 0.2):
            return 6
        case (currentZoomScalePopup > 0.1):
            return 7
        case (currentZoomScalePopup > 0.075):
            return 8
        case (currentZoomScalePopup > 0):
            return 10
    }
}

/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadiusRadial(d, edgeLength = 300) {
    d.radius = minNodeRadiusPopup;
    if ((d.children === undefined || d.children === null) && (d._children === undefined || d._children === null)) return d.radius; //No children

    let children = d.children ?? d._children; //Assign children collapsed or not

    children.length > 2 ? d.radius = minNodeRadiusPopup + incrementRadiusFactorPerChildPopup * children.length // more than 2 children
        : children.length === 2 ? d.radius = minNodeRadiusPopup + incrementRadiusFactorPerChildPopup * 2 //2 children
            : d.radius = minNodeRadiusPopup + incrementRadiusFactorPerChildPopup; //One child

    //Avoid the root node from being so large that overlaps/hides its children
    if (d.parent === undefined && d.radius > edgeLength / 2) d.radius = edgeLength / 2.0;
    return d.radius;
}

/**********************
*   D3 GET JSON DATA  *
***********************/

function removeLayout() {
    //document.body.classList.remove('tree')
    //document.body.classList.remove('force')
    //document.body.classList.remove('radial')
    //document.body.classList.remove('circle')
    document.querySelector(".modal-body .my-tooltip").remove();
    document.querySelector(".modal-body #graph-container").remove();
}

$(popup_container).on("open", function () {
    // Get JSON data
    treeJSON = d3.json(datasetPopup, function (error, treeData) {
        if (error) throw error;

        let treeModalButton = $('.tree-modal-button');
        let forceModalButton = $('.force-modal-button');
        let radialModalButton = $('.radial-modal-button');
        let circleModalButton = $('.circle-modal-button');

        treeModalButton.css('opacity', '0.4');
        forceModalButton.css('opacity', '0.4');
        radialModalButton.css('opacity', '0.4');
        circleModalButton.css('opacity', '0.4');

        switch (hierarchyName) {
            case "Elongated":
                document.querySelector(".modal .modal-content").style.width = "1472px";
                document.querySelector(".modal .modal-content").style.height = "522px";
                document.getElementById("popupModal").style.top = "calc(30% - 261px)";
                document.getElementById("popupModal").style.left = "calc(50% - 736px)";
                initialCanvasHeightPopup = 450;
                initialCanvasWidthPopup = 1400;
                treeModalButton.css('opacity', '1');
                createTreeGraph();
                break;
            case "Compact":
                document.querySelector(".modal .modal-content").style.width = "722px";
                document.querySelector(".modal .modal-content").style.height = "622px";
                document.getElementById("popupModal").style.top = "calc(35% - 311px)";
                document.getElementById("popupModal").style.left = "calc(50% - 361px)";
                initialCanvasHeightPopup = 550;
                initialCanvasWidthPopup = 650;
                radialModalButton.css('opacity', '1');
                createRadialGraph();
                break;
            case "nCompact": case "Hybrid": case "Unspecified":
                document.querySelector(".modal .modal-content").style.width = "722px";
                document.querySelector(".modal .modal-content").style.height = "622px";
                document.getElementById("popupModal").style.top = "calc(35% - 311px)";
                document.getElementById("popupModal").style.left = "calc(50% - 361px)";
                initialCanvasHeightPopup = 550;
                initialCanvasWidthPopup = 650;
                forceModalButton.css('opacity', '1');
                createForceGraph();
                break;
        }

        let graphContainerJQuery = $("#graph-container");
        $(document).ready(function () {
            jQuery(".tree-modal-button").click(function () {
                if (!graphContainerJQuery.hasClass("tree")) {
                    document.querySelector(".modal .modal-content").style.width = "1472px";
                    document.querySelector(".modal .modal-content").style.height = "522px";
                    document.getElementById("popupModal").style.top = "calc(30% - 261px)";
                    document.getElementById("popupModal").style.left = "calc(50% - 736px)";
                    $(this).css('opacity', '1');
                    $('.force-modal-button').css('opacity', '0.4');
                    $('.radial-modal-button').css('opacity', '0.4');
                    $('.circle-modal-button').css('opacity', '0.4');
                    graphContainerJQuery.removeClass('force radial circle').addClass("tree");
                    removeLayout();
                    createTreeGraph();
                }
            });

            jQuery(".force-modal-button").click(function () {
                if (!graphContainerJQuery.hasClass("force")) {
                    document.querySelector(".modal .modal-content").style.width = "722px";
                    document.querySelector(".modal .modal-content").style.height = "622px";
                    document.getElementById("popupModal").style.top = "calc(35% - 311px)";
                    document.getElementById("popupModal").style.left = "calc(50% - 361px)";
                    $(this).css('opacity', '1');
                    $('.tree-modal-button').css('opacity', '0.4');
                    $('.radial-modal-button').css('opacity', '0.4');
                    $('.circle-modal-button').css('opacity', '0.4');
                    graphContainerJQuery.removeClass('tree radial circle').addClass("force");
                    removeLayout();
                    createForceGraph();
                }
            });

            jQuery(".radial-modal-button").click(function () {
                if (!graphContainerJQuery.hasClass("radial")) {
                    document.querySelector(".modal .modal-content").style.width = "722px";
                    document.querySelector(".modal .modal-content").style.height = "622px";
                    document.getElementById("popupModal").style.top = "calc(35% - 311px)";
                    document.getElementById("popupModal").style.left = "calc(50% - 361px)";
                    $(this).css('opacity', '1');
                    $('.tree-modal-button').css('opacity', '0.4');
                    $('.force-modal-button').css('opacity', '0.4');
                    $('.circle-modal-button').css('opacity', '0.4');
                    removeLayout();
                    graphContainerJQuery.removeClass('tree force circle').addClass("radial");
                    createRadialGraph();
                }
            });

            jQuery(".circle-modal-button").click(function () {
                if (!graphContainerJQuery.hasClass("circle")) {
                    document.querySelector(".modal .modal-content").style.width = "722px";
                    document.querySelector(".modal .modal-content").style.height = "622px";
                    document.getElementById("popupModal").style.top = "calc(35% - 311px)";
                    document.getElementById("popupModal").style.left = "calc(50% - 361px)";
                    $(this).css('opacity', '1');
                    $('.tree-modal-button').css('opacity', '0.4');
                    $('.force-modal-button').css('opacity', '0.4');
                    $('.radial-modal-button').css('opacity', '0.4');
                    graphContainerJQuery.removeClass('tree force radial').addClass("circle");
                    removeLayout();
                    createCircleGraph();
                }
            });
        });

        /********************
         *       TREE       *
         ********************/

        function createTreeGraph() {

            rootPopup = treeData; //Define the root

            /* Vars for tendency and hierarchy calculations */
            var N = document.getElementById("input-n-field").value;
            var L = document.getElementById("input-l-field").value;
            var GFcomp = document.getElementById("input-gfcomp-field").value;
            var GFelon = document.getElementById("input-gfelon-field").value;
            var d_lvl = document.getElementById("input-d-field").value; //this is d, i was too lazy to change all other vars. names
            var tol = document.getElementById("input-tol-field").value;

            var colorDevtools = ["#88FF00", "#FFBB00",
                "#FF5500", "#90F6B2", "#1B8055",
                "#97CFFF", "#1795FF", "#0B5696"
            ];

            // Calculate total nodes, max label length
            var totalNodes = 0;
            var edgeLength = 300;

            // Misc. variables
            var i = 0;
            var duration = 750;
            var rootName = "News Article";

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


            var imageOffset = 4; //Radii size difference between a node and its associated image
            imgRatioPopup = 10; //Percentage of difference between the radii of a node and its associated image

            /* Targets: size, position, local path, objects to draw the target as ring
     * */
            var targetIconHeight = 15,
                targetIconWidth = 15,
                targetIconGroupX = -30,
                targetIconPersonX = -50,
                targetIconStereotypeX = -70,
                targetIconY = -10; //Size and relative position of targets drawn as icons

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

            minZoomPopup = 0.05;
            maxZoomPopup = 8;

            separationHeightPopup = 10; //Desired separation between two node brothers

    /* Creation of the tree with nodeSize
     * We indicate the reserved area for each node as [height, width] since our tree grows horizontally
     * Sorts nodes by level of toxicity (from lower to higher)
     *
     * NOTE: tree must be sorted at the creation of the tree, otherwise when collapsing and uncollapsing a node
     * the order of the nodes might change, disturbing the user mental map of the tree
     *
     * */
            var tree = d3.layout.tree()
                .nodeSize(rootPopup.children.length, 0) //NOTE the width is overwritten later
                .sort(function (a, b) {
                    return d3.ascending(a.toxicity_level, b.toxicity_level); //NOTE: this avoids the tree being sorted and changed when collapsing a node
                });

            // define a d3 diagonal projection for use by the node paths later on.
            var diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });
            // Hover rectangle in which the information of a node is displayed
            var tooltip = d3.select(popup_container)
                .append("div")
                .attr("id", "my-tooltip")
                .attr("class", "my-tooltip") //add the tooltip class
                .style("position", "absolute")
                .style("z-index", "60")
                .style("visibility", "hidden");

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


            var currentX = initialXPopup;
            var currentY = initialYPopup;
            var currentScale = initialZoomPopup;

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
            var zoomListenerTree = d3.behavior
                .zoom()
                .scaleExtent([minZoomPopup, maxZoomPopup])
                .on("zoom", function () {
                    currentZoomScalePopup = d3.event.scale
                    link.style("stroke-width", getEdgeStrokeWidth()); //Enlarge stroke-width on zoom out
                    node.select("circle").style("stroke-width", getNodeStrokeWidthTree()); //Enlarge stroke-width on zoom out
                    zoom();
                });

            // define the baseSvg, attaching a class for styling and the zoomListener
            var baseSvg = d3
                .select(popup_container)
                .append("svg")
                .attr("id", "graph-container")
                .attr("width", canvasWidthPopup)
                .attr("height", canvasHeightPopup)
                .attr("class", "overlay-popup")
                .call(zoomListenerTree);


            var svgGroup = baseSvg.append("g");

            var link = svgGroup.selectAll("path.link"),
                node = svgGroup.selectAll("g.node");


            /**
             * Center the screen to the position of the given node
             * */
            function centerNode(source) {
                scale = zoomListenerTree.scale();
                x = -source.y0;
                y = -source.x0;
                x = x * scale + viewerWidthPopup / 2;
                y = y * scale + viewerHeightPopup / 2;
                d3.select("g")
                    .transition()
                    .duration(duration)
                    .attr(
                        "transform",
                        "translate(" + x + "," + y + ")scale(" + scale + ")"
                    );
                zoomListenerTree.scale(scale);
                zoomListenerTree.translate([x, y]);
            }

            /**
             * Center the screen to the position of the given link
             * */
            function centerLink(link) {
                scale = zoomListenerTree.scale();
                x = -(link.source.y0 + link.target.y0) / 2;
                y = -(link.source.x0 + link.target.x0) / 2;
                x = x * scale + viewerWidthPopup / 2;
                y = y * scale + viewerHeightPopup / 2;
                d3.select("g")
                    .transition()
                    .duration(duration)
                    .attr(
                        "transform",
                        "translate(" + x + "," + y + ")scale(" + scale + ")"
                    );
                zoomListenerTree.scale(scale);
                zoomListenerTree.translate([x, y]);
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
                update(d, false); //NOTE: we are passing each sun that was collapsed
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
                            .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
                            .style("stroke-width", getNodeStrokeWidthTree())
                            .attr("opacity", function (d) {
                                if (d.parent === undefined) return 0;
                                //let l = getLevelRange(d);
                                let l = L;
                                let t = d_lvl;
                                let h = getHierarchy(d, l, GFcomp, t);
                                listOpacity = [0, 0, 0, 0, 0, 0, 0];
                                if (elongatedTendency(d, l)) {
                                    listOpacity[0] = 1;
                                }
                                if (compactTendency(d, l, GFcomp)) {
                                    listOpacity[1] = 1;
                                }
                                if (checkSignificant(d, tol)) {
                                    listOpacity[2] = 1;
                                }
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

            /* SECTION: Draw features*/

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
                            .attr("fill", colorFeaturePopup[i])
                            .style("stroke", "black")
                            .style("stroke-width", getNodeStrokeWidthTree())
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
                            .style("stroke-width", getNodeStrokeWidthTree())
                            .attr(
                                "href",
                                pathFeatures + localPath + allObjectsInNode[i].fileName
                            )
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
                        .attr("fill", colorFeaturePopup[0])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .attr("fill", colorFeaturePopup[1])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .attr("fill", colorFeaturePopup[2])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .attr("fill", colorFeaturePopup[3])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .attr("fill", colorFeaturePopup[4])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .attr("fill", colorFeaturePopup[5])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .attr("fill", colorFeaturePopup[6])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .attr("fill", colorFeaturePopup[7])
                        .style("stroke", "black")
                        .style("stroke-width", getNodeStrokeWidthTree())
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
                        .style("opacity", opacityValuePopup);

                    link
                        .filter(function (d) {
                            return d.target.toxicity_level !== 0;
                        })
                        .style("opacity", opacityValuePopup);
                }

                //Toxicity not 1
                if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
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
                if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
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
                if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
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
                if (enabledHighlight.indexOf("highlight-neutral") > -1) {
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
                if (enabledHighlight.indexOf("highlight-positive") > -1) {
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
                if (enabledHighlight.indexOf("highlight-negative") > -1) {
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
                if (enabledHighlight.indexOf("highlight-group") > -1) {
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
                if (enabledHighlight.indexOf("highlight-person") > -1) {
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
                if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
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
                if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
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
                if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
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
                if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
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
                if (enabledHighlight.indexOf("highlight-mockery") > -1) {
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
                if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
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
                if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
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
                if (enabledHighlight.indexOf("highlight-insult") > -1) {
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
                if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
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
                if (enabledHighlight.length === 0) {
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
                        return d.target.highlighted ? 1 : opacityValuePopup;
                    });
                } else {
                    //Highlight only the edges whose both endpoints are highlighted
                    link.style("opacity", function (d) {
                        return d.source.highlighted && d.target.highlighted ? 1 : opacityValuePopup;
                    });
                }
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
                //Write growingFactor of node
                tooltipTextPopup += "</table>";
                //var s = getLevelRange(d);
                var s = L;
                tooltipTextPopup += "<br> <table><tr><td> Growing Factor: " + getGrowFactor(d, s) + "</td></tr></table>";
                //Calculate tendencies and hierarchy of nodes
                tooltipTextPopup += "<br> <table>" +
                    "<tr>" +
                    "<td> ET: " + elongatedTendency(d, s) + "</td>" +
                    "<td> CT: " + compactTendency(d, s, GFcomp) + "</td>" +
                    "</tr></table>"
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

                for (i = 0; i < sonValues.length; i++) {
                    if (i % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
                    tooltipTextPopup +=
                        "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                    if ((i + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
                }

                //Write growingFactor of root
                tooltipTextPopup += "</table>";
                //var s = getLevelRange(d);
                var s = L;
                tooltipTextPopup += "<br> <table><tr><td> Growing Factor: " + getGrowFactor(d, s) + "</td></tr>";
                //Calculate tendencies and hierarchy of nodes
                tooltipTextPopup +=
                    "<tr>" +
                    "<td> ET: " + elongatedTendency(d, s) +
                    " CT: " + compactTendency(d, s, GFcomp) + "</td>" +
                    "</tr>"
                //Calculate hierarchy
                var t = d_lvl;
                var h = getHierarchy(d, s, GFcomp, t);
                tooltipTextPopup +=
                    "<tr>" +
                    "<td> Hierarchy: " + hierarchyList[h] + "</td>" +
                    "</tr></table>"
                tooltipTextPopup += "<br> <table>";
            }


            function update(source, first_call) {
                tree = tree
                    .nodeSize([separationHeightPopup, 0]) //heigth and width of the rectangles that define the node space
                    .separation(function (a, b) {
                        //Compute the radius of the node for the first visualization of the graph
                        if (a.radius === undefined) a.radius = computeNodeRadiusTree(a);
                        if (b.radius === undefined) b.radius = computeNodeRadiusTree(b);

                        return Math.ceil((a.radius + b.radius) / separationHeightPopup) + 0.5;
                    });

                // Compute the new tree layout.
                nodesPopup = tree.nodes(rootPopup).reverse();
                //nodes = tree.nodes(root);
                var links = tree.links(nodesPopup);

                // Set widths between levels based on edgeLength.
                nodesPopup.forEach(function (d) {
                    d.y = d.depth * edgeLength;
                });

                // Update the nodes…
                var node = svgGroup.selectAll("g.node").data(nodesPopup, function (d) {
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
                    })
                    .on("mouseover", function (d) {
                        var highlighted_nodes = node.filter(function (n) {
                            return n.highlighted;
                        })[0].map(i => i.__data__.name); // don't ask..
                        if (d !== rootPopup && highlighted_nodes.includes(d.name)) {
                            writeTooltipText(d);
                            tooltip.style("visibility", "visible").html(tooltipTextPopup);
                        } else if (d == rootPopup) {
                            writeTooltipRoot(d);
                            tooltip.style("visibility", "visible").html(tooltipTextPopup);
                        }
                    })
                    .on("mousemove", function (d) {
                        // if (d !== root) {
                        return tooltip.style("top", (d3.mouse(document.querySelector(".overlay-popup"))[1] - 30) + "px").style("left", (d3.mouse(document.querySelector(".overlay-popup"))[0] - 440) + "px");
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
                    .style("stroke-width", getNodeStrokeWidthTree());

                function featureVisualizationListener() {
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

                function buttonsDevtoolsClick() {
                    enabledTargets =
                        Array.from(checkboxesDevtools) // Convert checkboxes to an array to use filter and map.
                            .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                            .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                    highlightDevtoolsAND(node, link, enabledTargets);

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

                        function checkboxesTargetsListener(event) {
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

                        function checkboxesListener(event) {
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

                        function checkboxesHighlightGroupORListener(event) {
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

                        function checkboxesHighlightGroupANDListener(event) {
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

                        function checkboxesDevtoolsListener(event) {
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

                        codeReadyPopup = true;
                    });

                } catch (TypeError) {
                    console.error("Error attaching buttons... trying again...");
                }

                function checkboxANDListener() {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
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
                    checkboxAND.addEventListener("change", checkboxANDListener);
                }

                function checkboxORListener() {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
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
                    checkboxOR.addEventListener("change", checkboxORListener);
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
                    currentScale = Math.min(3.0, zoomListenerTree.scale() + 0.1);

                    zoomListenerTree.scale(currentScale)
                        // .translate([2200 - currentX - currentScale, 900 - currentY - currentScale])
                        .event(svgGroup);
                    console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_in', ' | [Date]', Date.now());
                });

                d3.select("#zoom_out_icon").on("click", function () {
                    currentScale = Math.max(0.1, currentScale - 0.1);

                    zoomListenerTree.scale(currentScale)
                        // .translate([2200 - currentX + currentScale, 900 - currentY + currentScale])
                        .event(svgGroup);
                    console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_in', ' | [Date]', Date.now());
                });

                d3.select("#zoom_reset_icon").on("click", function () {
                    currentScale = 0.4;

                    zoomListenerTree.scale(currentScale)
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
                        return computeNodeRadiusTree(d);
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
                nodesPopup.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            // Append a group which holds all nodes and which the zoom Listener can act upon.

            // Define the root position
            rootPopup.x0 = viewerHeightPopup / 2;
            rootPopup.y0 = 0;


            // Graph statistics information is displayed by default;
            update(rootPopup, true);
            // Layout the tree initially and center on the root node.
            centerNode(rootPopup);

            function initPositionTreePopup() {

                var box = computeDimensions(nodesPopup);
                var initialSight = zoomToFitGraph(box.minX, box.minY, box.maxX, box.maxY, rootPopup, initialCanvasHeightPopup, initialCanvasWidthPopup);
                initialZoomPopup = initialSight.initialZoom;
                initialXPopup = initialSight.initialX;
                initialYPopup = initialSight.initialY;

                zoomListenerTree.scale(initialZoomPopup);
                zoomListenerTree.translate([initialYPopup, initialXPopup]);
                zoomListenerTree.event(baseSvg);
            }

            initPositionTreePopup();

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

            console.log('[User]', user.split('/')[2], '| [interaction]', 'Tree_layout_loaded', ' | [Date]', Date.now());
        }

        /********************
         *       FORCE       *
         *********************/

        function createForceGraph() {

            rootPopup = treeData; //Define the root

            // Size of the canvas, root element and nodes
            var width = $(document).width(),
                height = $(document).height(), rootName = "News Article";


            initialZoomScalePopup = 0.1;
            minZoomPopup = 0.05;
            maxZoomPopup = 8;

            //Node radius
            minNodeRadiusPopup = 30;
            incrementRadiusFactorPerChildPopup = 5;
            dotRadiusPopup = 15;

            imgRatioPopup = 20; //Percentage of difference between the radii of a node and its associated image

            var optimalK; //Computed optimal distance between nodes

            var ringHeight = 55, ringWidth = 55, ringX = -10, ringY = -10;

            var currentX = initialXPopup;
            var currentY = initialYPopup;
            var currentScale = initialZoomPopup;


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
                let newScale = Math.max(initialZoomPopup + (d3.event.scale - 1), 0.1); //Avoid the graph to be seen mirrored.
                //console.log("New scale is: ", initialZoomScale + (d3.event.scale - 1))
                /*
            * NOTE: Add to the initial position values (initialX and initialY) the movement registered by d3.
            * d3.event.translate returns an array [x,y] with starting values [50, 200]
            * The values X and Y are swapped in zoomToFit() and we need to take that into account to give the new coordinates
            * */
                let movement = d3.event.translate;
                let newX = initialXPopup + (movement[1]);
                let newY = initialYPopup + (movement[0]);
                svg.attr("transform", "translate(" + [newY, newX] + ")scale(" + newScale + ")");
                currentScale = newScale;

            }

            let zoomListenerForce = d3.behavior.zoom().scaleExtent([minZoomPopup, maxZoomPopup]).on("zoom", function () {
                currentZoomScalePopup = d3.event.scale
                link.style("stroke-width", getEdgeStrokeWidth()); //Enlarge stroke-width on zoom out
                node.select("circle").style("stroke-width", getNodeStrokeWidthForce()); //Enlarge stroke-width on zoom out
                zoom();
            });

            /*
        Targets: size, position, local path, objects to draw the target as ring
        * */
            var drawingAllInOne = false; //if we are drawing all together or separated
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
                .size([canvasWidthPopup * canvasFactorPopup, canvasHeightPopup * canvasFactorPopup])
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
                .attr("id", "my-tooltip")
                .attr("class", "my-tooltip") //add the tooltip class
                .style("position", "absolute")
                .style("z-index", "60")
                .style("visibility", "hidden");

            var svg = d3.select(popup_container) //Define the container that holds the layout
                .append("svg")
                .attr("id", "graph-container")
                .attr("width", canvasWidthPopup)
                .attr("height", canvasHeightPopup)
                .attr("class", "overlay-popup")
                //.call(d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", zoom)) //Allow zoom
                .call(zoomListenerForce) //Allow zoom
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
                    color: colourArgumentationPopup,
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
                    color: colourConstructivenessPopup,
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
                    color: colourSarcasmPopup,
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
                    color: colourMockeryPopup,
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
                    color: colourIntolerancePopup,
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
                    color: colourImproperPopup,
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
                    color: colourInsultPopup,
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
                    color: colourAggressivenessPopup,
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
            function positionImage(nodeRadius, radiusPercentage = imgRatioPopup) {
                return Math.min(nodeRadius * (radiusPercentage / 100.0 - 1), 300);
            }

            /**
             * Compute the size of an associated image to be a radiusPercentage smaller than the node
             * */
            function sizeImage(nodeRadius, radiusPercentage = imgRatioPopup) {

                return Math.min(2 * nodeRadius * (1 - radiusPercentage / 100.0));
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
                            .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
                            .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
                            .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
                            .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
                            .attr("opacity", function (d) {
                                if (d.parent === null) return 0;
                                listOpacity = [d.target_group, d.target_person, d.stereotype];
                                return listOpacity[i];
                            });
                    }
                }
            }

            /* SECTION: Draw features*/

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

                var cbFeatureEnabled = [enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
                    enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
                    enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

                var features = [objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
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
                            .attr("r", dotRadiusPopup)
                            .attr("transform", function (d) {
                                return "translate(" + ((d.radius + dotRadiusPopup) * features[i].xDot) + "," + ((d.radius + dotRadiusPopup) * features[i].yDot) + ")";


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
                    .attr('class', objRootPopup.class)
                    .attr('id', objRootPopup.id)
                    .attr("x", positionImage(Math.min(rootPopup.radius, 300), 0))
                    .attr("y", positionImage(Math.min(rootPopup.radius, 300), 0))
                    .attr("height", sizeImage(Math.min(rootPopup.radius, 300), 0))
                    .attr("width", sizeImage(Math.min(rootPopup.radius, 300), 0))

                    .attr("href", rootPathPopup + objRootPopup.fileName)
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
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (d.target.toxicity_level !== 0);
                    }).style("opacity", opacityValuePopup);
                }

                //Toxicity not 1
                if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
                    node.filter(function (d) {
                        return (d.toxicity_level !== 1);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (d.target.toxicity_level !== 1);
                    }).style("opacity", opacityValuePopup);
                }

                //Toxicity not 2
                if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
                    node.filter(function (d) {
                        return (d.toxicity_level !== 2);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (d.target.toxicity_level !== 2);
                    }).style("opacity", opacityValuePopup);
                }

                //Toxicity not 3
                if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
                    node.filter(function (d) {
                        return (d.toxicity_level !== 3);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (d.target.toxicity_level !== 3);
                    }).style("opacity", opacityValuePopup);
                }

                //Neutral stance CB is checked
                if (enabledHighlight.indexOf("highlight-neutral") > -1) {
                    node.filter(function (d) {
                        return (d.positive_stance || d.negative_stance);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (d.target.positive_stance || d.target.negative_stance);
                    }).style("opacity", opacityValuePopup);
                }

                //Positive stance CB is checked
                if (enabledHighlight.indexOf("highlight-positive") > -1) {
                    node.filter(function (d) {
                        return (!d.positive_stance);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.positive_stance);
                    }).style("opacity", opacityValuePopup);
                }

                //Negative stance CB is checked
                if (enabledHighlight.indexOf("highlight-negative") > -1) {
                    node.filter(function (d) {
                        return (!d.negative_stance);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.negative_stance);
                    }).style("opacity", opacityValuePopup);
                }

                //Target group CB is checked
                if (enabledHighlight.indexOf("highlight-group") > -1) {
                    node.filter(function (d) {
                        return (!d.target_group);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.target_group);
                    }).style("opacity", opacityValuePopup);
                }

                //Target person CB is checked
                if (enabledHighlight.indexOf("highlight-person") > -1) {
                    node.filter(function (d) {
                        return (!d.target_person);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.target_person);
                    }).style("opacity", opacityValuePopup);
                }

                //Stereotype CB is checked
                if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
                    node.filter(function (d) {
                        return (!d.stereotype);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.stereotype);
                    }).style("opacity", opacityValuePopup);
                }

                //Argumentation CB is checked
                if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
                    node.filter(function (d) {
                        return (!d.argumentation);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.argumentation);
                    }).style("opacity", opacityValuePopup);
                }

                //Constructiveness CB is checked
                if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
                    node.filter(function (d) {
                        return (!d.constructiveness);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.constructiveness);
                    }).style("opacity", opacityValuePopup);
                }

                //Sarcasm CB is checked
                if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
                    node.filter(function (d) {
                        return (!d.sarcasm);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.sarcasm);
                    }).style("opacity", opacityValuePopup);
                }

                //Mockery CB is checked
                if (enabledHighlight.indexOf("highlight-mockery") > -1) {
                    node.filter(function (d) {
                        return (!d.mockery);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.mockery);
                    }).style("opacity", opacityValuePopup);
                }
                //Intolerance CB is checked
                if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
                    node.filter(function (d) {
                        return (!d.intolerance);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.intolerance);
                    }).style("opacity", opacityValuePopup);
                }
                //Improper language CB is checked
                if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
                    node.filter(function (d) {
                        return (!d.improper_language);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.improper_language);
                    }).style("opacity", opacityValuePopup);
                }

                //Insult language CB is checked
                if (enabledHighlight.indexOf("highlight-insult") > -1) {
                    node.filter(function (d) {
                        return (!d.insult);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.insult);
                    }).style("opacity", opacityValuePopup);
                }

                //Aggressiveness language CB is checked
                if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
                    node.filter(function (d) {
                        return (!d.aggressiveness);
                    }).style("opacity", opacityValuePopup);

                    link.filter(function (d) {
                        return (!d.target.aggressiveness);
                    }).style("opacity", opacityValuePopup);
                }
            }

            function highlightNodesByPropertyOR(node, link) {
                if (enabledHighlight.length === 0) { //If no tag (toxicity, stance,...) checkbox is selected: highlight all

                    nodesPopup.forEach(function (d) {
                        d.highlighted = 1;
                    });
                    node.style("opacity", 1);
                } else { //If some tag checkbox is selected behave as expected

                    //First, unhighlight everything and set the parameter highlighted to 0
                    nodesPopup.forEach(function (d) {
                        d.highlighted = 0;
                    });
                    node.style("opacity", opacityValuePopup);

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
                        return d.target.highlighted ? 1 : opacityValuePopup;
                    });
                } else {
                    //Highlight only the edges whose both endpoints are highlighted
                    link.style("opacity", function (d) {
                        return (d.source.highlighted && d.target.highlighted) || (d.source.parent === null && d.target.highlighted) ? 1 : opacityValuePopup;
                    });
                }
            }

            function highlightNodesByPropertyAND(node, link) {
                nodesPopup.forEach(function (d) {
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
                        return d.target.highlighted ? 1 : opacityValuePopup;
                    });
                } else {
                    //Highlight only the edges whose both endpoints are highlighted
                    link.style("opacity", function (d) {
                        return (d.source.highlighted && d.target.highlighted) || (d.source.parent === null && d.target.highlighted) ? 1 : opacityValuePopup;
                    });
                }
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
                tooltipTextPopup = "<table>";

                for (i = 0; i < jsonValues.length; i++) {
                    if (i === 3 || i === 12) tooltipTextPopup += "<tr><td></td></tr>"; // I want a break between the first line and the features and the targets
                    if (i % 3 === 0) tooltipTextPopup += "<tr>"; //Start table line
                    if (i < 3) tooltipTextPopup += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>"; //First ones without bold
                    else if (jsonValues[i] !== -1) jsonValues[i] ? tooltipTextPopup += "<td><b>" + jsonNames[i] + ": " + jsonValues[i] + "</b></td>" : tooltipTextPopup += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>";
                    if ((i + 1) % 3 === 0) tooltipTextPopup += "</tr>"; //End table line
                }

                tooltipTextPopup += "</table>";

                tooltipTextPopup += "<br> <table>";
                //If node is collapsed, we also want to add some information about its sons
                if (d._children) {
                    var sonTitles = ["Direct comments", "Total number of generated comments", "Not toxic", "Mildly toxic", "Toxic", "Very toxic"];
                    var sonValues = [d._children.length, d.numberOfDescendants, d.descendantsWithToxicity0, d.descendantsWithToxicity1, d.descendantsWithToxicity2, d.descendantsWithToxicity3];

                    for (i = 0; i < sonValues.length; i++) {
                        if (i % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
                        tooltipTextPopup += "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                        if ((i + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
                    }

                }
                tooltipTextPopup += "</table>";
                tooltipTextPopup += "<br>" + d.coment;
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
                tooltipTextPopup = "<table>";
                tooltipTextPopup += "<br> <table>";

                for (i = 0; i < sonValues.length; i++) {
                    if (i % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
                    tooltipTextPopup +=
                        "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                    if ((i + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
                }

                tooltipTextPopup += "</table>";


            }


            function setCircularPositions(node, angle) {
                //console.log("Node: ", node, angle)
                if (!node.children && !node._children) {
                    node.x = canvasWidthPopup / 2.0 + node.depth * Math.cos((node.parent.children?.length || node.parent._children?.length) * angle);
                    node.y = canvasHeightPopup / 2.0 + node.depth * Math.sin((node.parent.children?.length || node.parent._children?.length) * angle);
                }

                let children = node.children ?? node._children;

                if (children) {
                    children.forEach(function (d) {
                        //console.log("Quantity of children: ", (getStatisticValues(d).children || 1));
                        let angle = 2 * Math.PI / (getStatisticValues(d).children || 1);
                        setCircularPositions(d, angle);
                        d.x = canvasWidthPopup / 2.0 + d.depth * Math.cos((d.parent.children?.length || d.parent._children?.length) * angle);
                        d.y = canvasHeightPopup / 2.0 + d.depth * Math.sin((d.parent.children?.length || d.parent._children?.length) * angle);
                        //console.log("Node: ", d, angle)
                    })
                }
            }

            /*
        Functions
        * */
            function update() {
                nodesPopup = flatten(rootPopup); //get nodes as a list
                var links = d3.layout.tree().links(nodesPopup);

                optimalK = getOptimalK(nodesPopup); // compute optimal distance between nodes

                rootPopup.fixed = true;
                rootPopup.x = 0;
                rootPopup.y = 0;

                // Restart the force layout.
                force
                    .nodes(nodesPopup)
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
                        if (d.target.positive_stance && d.target.negative_stance) return colourBothStancesPopup; //Both against and in favour
                        else if (d.target.positive_stance === 1) return colourPositiveStancePopup; //In favour
                        else if (d.target.negative_stance === 1) return colourNegativeStancePopup; //Against
                        else return colourNeutralStancePopup; //Neutral comment
                    })
                    .style("stroke-width", getEdgeStrokeWidth());


                node = svgGroup.selectAll("g.node")
                    .data(nodesPopup, function (d) {
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
                        if (d !== rootPopup && highlighted_nodes.includes(d.name)) {
                            writeTooltipText(d);
                            tooltip.style("visibility", "visible")
                                .html(tooltipTextPopup);
                        } else if (d == rootPopup) {
                            writeTooltipRoot(d);
                            tooltip.style("visibility", "visible").html(tooltipTextPopup);
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
                                if (!isDblclick) { // A simple click.
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

                containerNode.append("circle")
                    .attr("r", 10);

                //visualiseTargets(node); //Add images before the node circle

                // Update radius and colour of a node when collapsing it
                node.selectAll("circle").transition()
                    .attr("r", function (d) {
                        return computeNodeRadiusForce(d);
                    })
                    .style("fill", function (d) {
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
                    })
                    .style("stroke", "black")
                    .style("stroke-width", getNodeStrokeWidthForce())
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

                try {
                    $(document).ready(function () {

                        var checkboxesTargetsJQuery = $("input[type=checkbox][name=cbTargets]");
                        var checkboxesJQuery = $("input[type=checkbox][name=cbFeatures]");
                        var checkboxesHighlightGroupORJQuery = $("input[name=cbHighlightOR]");
                        var checkboxesHighlightGroupANDJQuery = $("input[name=cbHighlightAND]");

                        checkboxesTargetsJQuery.each(function () {
                            $(this).off("change.update"); // remove duplicate listener
                            $(this).on('change.update', function () {
                                enabledTargets =
                                    Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                                if ($(this).checked) {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                } else {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                }
                                selectTargetVisualization(node);
                            })
                        });

                        // Use Array.forEach to add an event listener to each checkbox.
                        // Draw feature circles
                        checkboxesJQuery.each(function () {
                            $(this).off("change.update"); // remove duplicate listener
                            $(this).on('change.update', function () {
                                enabledFeatures =
                                    Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                                if ($(this).checked) {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                } else {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                }
                                selectFeatureVisualization(node);

                            })
                        });


                        // Use Array.forEach to add an event listener to each checkbox.
                        checkboxesHighlightGroupORJQuery.each(function () {
                            $(this).off("change.update"); // remove duplicate listener
                            $(this).on('change.update', function () {
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
                                if ($(this).checked) {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                } else {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                }
                                checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
                            })
                        });

                        // Use Array.forEach to add an event listener to each checkbox.
                        checkboxesHighlightGroupANDJQuery.each(function () {
                            $(this).off("change.update"); // remove duplicate listener
                            $(this).on('change.update', function () {
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

                                if ($(this).checked) {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                } else {
                                    console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + $(this).name + '_' + $(this).value, " | [Date]", Date.now());
                                }
                                checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
                            })
                        });

                        // To notify the DOM that the ready function has finished executing.
                        // This to be able to manage the filters if it is given the case that the code of the onLoad function finishes before.
                        const event = new Event('codeReady');

                        // Dispatch the event.
                        document.querySelector("body").dispatchEvent(event);

                        codeReadyPopup = true;
                    });
                    /*END section cb*/

                } catch (TypeError) {
                    console.error("Error attaching buttons... trying again...");
                }

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
                update();
            }


            var svgGroup = svg.append("g"); //We define it here, otherwise, svg is not defined

            // Graph statistics information is displayed by default;
            update();

            force.alpha(1.5); //Restart the timer of the cooling parameter with a high value to reach better initial positioning

            function initPositionForcePopup() {
                zoomListenerForce.scale(initialZoomScalePopup);
                zoomListenerForce.translate([initialCanvasWidthPopup / 4, initialCanvasHeightPopup / 2]);
                zoomListenerForce.event(svg);
            }

            initPositionForcePopup();

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

            console.log('[User]', user.split('/')[2], '| [interaction]', 'Force_layout_loaded', ' | [Date]', Date.now());
        }

        /*********************
         *       RADIAL       *
         **********************/

        function createRadialGraph() {

            rootPopup = treeData; //Define the root

            // Calculate total nodes, max label length
            var totalNodes = 0;

            // Misc. variables
            var i = 0;
            var duration = 750;
            var rootName = "News Article";


            var groupDrawn = false, personDrawn = false;
            var opacityValue = 0.1;

            var circleRadius = 8.7;
            dotRadiusPopup = 10.5;

            imgRatioPopup = 10;

            /* Colours
       * */
            var colourBothStances = "#FFA500", colourPositiveStance = "#77dd77", colourNegativeStance = "#ff6961",
                colourNeutralStance = "#2b2727";
            var colourToxicity0 = "#f7f7f7", colourToxicity1 = "#cccccc", colourToxicity2 = "#737373",
                colourToxicity3 = "#000000", colourNewsArticle = "lightsteelblue",
                colourCollapsed1Son = "lightsteelblue";
            var colorFeature = ["#1B8055", "#90F6B2",
                "#97CFFF", "#1795FF", "#0B5696",
                "#E3B7E8", "#A313B3", "#5E1566"
            ];

            initialZoomScalePopup = 0.2; //Initial zoom scale to display almost the whole graph
            minZoomPopup = 0.05;
            maxZoomPopup = 8; //Zoom range

            //Node radius
            minNodeRadiusPopup = 15;
            incrementRadiusFactorPerChildPopup = 5;

            /* Root icon */
            var rootPath = pr;
            var objRoot = {
                class: "rootNode",
                id: "rootNode",
                fileName: "root.png"
            };

            /* Targets: size, position, local path, objects to draw the target as ring
        * */
            var drawingAllInOne = false; //if we are drawing all together or separated

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
            var cheeseX = -17.53, cheeseY = -27.45, cheeseHeight = 55, cheeseWidth = 55;
            var pathFeatures = pf;

            var objToxicity0 = {class: "toxicity0", id: "toxicity0", selected: 1, fileName: "Level0.svg"},
                objToxicity1 = {class: "toxicity1", id: "toxicity1", selected: 1, fileName: "Level1.svg"},
                objToxicity2 = {class: "toxicity2", id: "toxicity2", selected: 1, fileName: "Level2.svg"},
                objToxicity3 = {class: "toxicity3", id: "toxicity3", selected: 1, fileName: "Level3.svg"};

            var listCheeseImgPath = ["./images/features/trivialCheese/Gray.png", "./images/features/trivialCheese/Argumentation.png", "./images/features/trivialCheese/Constructiveness.png",
                "./images/features/trivialCheese/Sarcasm.png", "./images/features/trivialCheese/Mockery.png", "./images/features/trivialCheese/Intolerance.png",
                "./images/features/trivialCheese/Improper.png", "./images/features/trivialCheese/Insult.png", "./images/features/trivialCheese/Aggressiveness.png"];
            var listTargetImgPath = ["./images/targets/icons/Group.png", "./images/targets/icons/Person.png", "./images/targets/icons/Stereotype.png"];

            // size of the diagram
            var viewerWidth = $(document).width();
            var viewerHeight = $(document).height();
            separationHeightPopup = 61; //Desired separation between two node brothers
            var radiusFactor = 2; // The factor by which we multiply the radius of a node when collapsed with more than 2 children

            // The edge length is overwritten in the update()
            let tree = d3.layout.tree()
                .size([360, 0]) // breadth (x) is measured in degrees and the depth (y) is a radius r in pixels, say [360, r].
                .separation(function (a, b) {
                    let separation;

                    if (a.depth === 0) separation = 1;
                    else if (a.parent !== b.parent) separation = 2 / a.depth;
                    else {
                        if (a._children?.length >= 5 || b._children?.length >= 5) separation = 3 / a.depth; // if 5 children or more collapsed
                        else separation = 1 / a.depth;
                    }

                    return separation;
                })
                .sort(function (a, b) {
                    return d3.ascending(a.toxicity_level, b.toxicity_level);
                });

            // define a d3 diagonal projection for use by the node paths later on.
            var diagonal = d3.svg.diagonal.radial()
                .projection(function (d) {
                    return [d.y, d.x / 180 * Math.PI];
                });

            /**
             * Computes the rectangular coordinates from the polar coordinates
             * @param x: angle theta of a point in polar coordinates
             * @param y: radius r of a point in polar coordinates
             *
             * Conversion formula to convert from polar to rectangular coordinates
             * x = r cos(theta)
             * y = r sin(theta)
             *
             * @return rectangular coordinates
             *
             * This is from the official library https://github.com/d3/d3-shape/blob/master/src/pointRadial.js
             * */
            function radialPoint(x, y) {
                return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
            }

            // Hover rectangle in which the information of a node is displayed
            var tooltip = d3.select(popup_container)
                .append("div")
                .attr("id", "my-tooltip")
                .attr("class", "my-tooltip") //add the tooltip class
                .style("position", "absolute")
                .style("z-index", "60")
                .style("visibility", "hidden");

            /*SECTION zoom*/
            var zoomLabel = document.getElementById("zoom_level");
            var XLabel = document.getElementById("position_x");
            var YLabel = document.getElementById("position_y");

            /*SECTION checkboxes*/
            //Check the values of the checkboxes and do something
            var checkbox = document.querySelector("input[name=cbTargets]");
            var checkboxesTargets = [document.getElementById("target-group"), document.getElementById("target-person"), document.getElementById("target-stereotype")];
            let enabledTargets = []; //Variable which contains the string of the enabled options to display targets

            // Select all checkboxes with the name 'cbFeatures' using querySelectorAll.
            var checkboxes = document.querySelectorAll("input[type=checkbox][name=cbFeatures]");
            let enabledFeatures = []; //Variable which contains the string of the enabled options to display features
            // var checkboxFeatureMenu = document.querySelector("input[name=cbFeatureMenu]");

            // Select how to display the features: svg circles or trivial cheese (previous version)
            var checkboxesPropertyFeature = document.querySelectorAll("input[type=checkbox][name=cbFeatureProperty]");
            var checkboxFeatureDot = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=dot-feat]");
            var checkboxFeatureCheese = document.querySelector("input[type=checkbox][name=cbFeatureProperty][value=cheese-feat]");

            //Dropdown menu
            var checkboxesPositioningFeature = document.querySelectorAll("input[type=checkbox][name=cbFeaturePositioning]");
            // var cbFeatureInside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=on-node]");
            // var cbFeatureOutside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=node-outside]");

            // Select which properties and if an intersection or union of those
            // var checkboxHighlightMenu = document.querySelector("input[name=cbHighlightMenu]");
            var checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
            var checkboxAND = document.querySelector("input[type=radio][name=cbHighlightProperty][value=and-group]");
            var checkboxOR = document.querySelector("input[type=radio][name=cbHighlightProperty][value=or-group]");
            var checkboxesHighlightGroupOR = document.querySelectorAll("input[name=cbHighlightOR]");
            var checkboxesHighlightGroupAND = document.querySelectorAll("input[name=cbHighlightAND]");

            // var checkboxStaticValues = document.querySelector("input[name=cbStaticValues]");


            let enabledHighlight = []; //Variable which contains the string of the enabled options to highlight
            /*END SECTION checkboxes*/

            var checkButtons = document.querySelectorAll("input[name=check_button_features]");


            /* Dropdown menus */
            // var dropdownTargets = document.getElementById("dropdown-targets");
            var dropdownFeatures = document.getElementById("dropdown-features");


            var dotsFeatures = document.getElementById("dots_icon_button");
            var glyphsFeatures = document.getElementById("glyphs_icon_button");

            //Define objects after the checkbox where we keep if it is selected
            var objTargetGroup = {
                    class: "targetGroup",
                    id: "targetGroup",
                    selected: enabledTargets.indexOf("target-group"),
                    x: -70,
                    y: -10,
                    xInside: -0.9,
                    yInside: -0.8,
                    height: targetIconHeightPopup,
                    width: targetIconWidthPopup,
                    fileName: "Group.svg"
                },
                objTargetPerson = {
                    class: "targetPerson",
                    id: "targetPerson",
                    selected: enabledTargets.indexOf("target-person"),
                    x: -90,
                    y: -10,
                    xInside: -0.5,
                    yInside: 0,
                    height: targetIconHeightPopup,
                    width: targetIconWidthPopup,
                    fileName: "Person.svg"
                },
                objTargetStereotype = {
                    class: "targetStereotype",
                    id: "targetStereotype",
                    selected: enabledTargets.indexOf("target-stereotype"),
                    x: -110,
                    y: -10,
                    xInside: -0.1,
                    yInside: -0.8,
                    height: targetIconHeightPopup,
                    width: targetIconWidthPopup,
                    fileName: "Stereotype.svg"
                };

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

            var currentX = 200;
            var currentY = 200;
            var currentScale = 0.5;


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
                let newScale = Math.max(initialZoomScalePopup + (d3.event.scale - 1), 0.1); //Avoid the graph to be seen mirrored.
                //console.log("New scale is: ", initialZoomScale + (d3.event.scale - 1))
                /*
            * NOTE: Add to the initial position values (initialX and initialY) the movement registered by d3.
            * d3.event.translate returns an array [x,y] with starting values [50, 200]
            * The values X and Y are swapped in zoomToFit() and we need to take that into account to give the new coordinates
            * */
                let movement = d3.event.translate;
                let newX = initialXPopup + (movement[1] - 200);
                let newY = initialYPopup + (movement[0] - 50);
                svgGroup.attr("transform", "translate(" + [newY, newX] + ")scale(" + newScale + ")");
                currentScale = newScale;

            }

            function zoom() {
                var zoom = d3.event;
                svgGroup.attr("transform", "translate(" + zoom.translate + ")scale(" + zoom.scale + ")");
                currentScale = zoom.scale;
            }

            let zoomListenerRadial = d3.behavior.zoom().scaleExtent([minZoomPopup, maxZoomPopup]).on("zoom", function () {
                currentZoomScalePopup = d3.event.scale
                linkPopup.style("stroke-width", getEdgeStrokeWidth()); //Enlarge stroke-width on zoom out
                nodePopup.select("circle").style("stroke-width", getNodeStrokeWidthRadial()); //Enlarge stroke-width on zoom out
                zoom();
            });


            // define the baseSvg, attaching a class for styling and the zoomListener
            var baseSvg = d3.select(popup_container).append("svg")
                .attr("id", "graph-container")
                .attr("width", canvasWidthPopup)
                .attr("height", canvasHeightPopup)
                .attr("class", "overlay-popup")
                .call(zoomListenerRadial);

            /**
             * Center the screen to the position of the given node
             * */
            function centerNode(source) {
                var angulo = source.x0 % 360;

                //By definition, the angle of the Math.cos function must be given in radians
                var zoomX = source.y0 * Math.cos(angulo * Math.PI / 180);
                var zoomY = source.y0 * Math.sin(angulo * Math.PI / 180);

                /*
            The coordinate system is a little bit different.
            The (0,0) point is approximately at the "bottom right" of where our tree is being displayed.
            The "News Article" is shown approximately at (500,300)
            The X axis is the horizontal one. It increases to the left and decreases to the right (the opposite of the cartesian system)
            The Y axis is the vertical one. It increases upward and decreases downwards.

            Taking into account that our definition of coordinates has the angles placed like
                       0º
                       |
              270º ---------- 90º
                       |
                     180º
            We have to sum and substract zoomX and zoomY to obtain the zoom in the given node.
            * */
                d3.select('g').transition()
                    .duration(duration)
                    .attr("transform", "translate(" + (500 - zoomY) + "," + (300 + zoomX) + ")");
            }

            /**
             * Center the screen to the position of the given link
             * */
            function centerLink(link) {
                scale = zoomListenerRadial.scale();
                /*
             NOTE: the Y values give us the radius; therefore, we want the average of this value
             the X value give us the angle; therefore, if the nodes are not in a line, we want the average value
             * */
                x = (link.source.y0 + link.target.y0) / 2;
                y = ((link.source.x0 % 360) + (link.target.x0 % 360)) / 2;

                var zoomX = x * Math.cos((y) * Math.PI / 180);
                var zoomY = x * Math.sin((y) * Math.PI / 180);

                d3.select('g').transition()
                    .duration(duration)
                    .attr("transform", "translate(" + ((viewerWidth / 2) - zoomY) + "," + ((viewerHeight / 2) + zoomX) + ")");

                // console.log("LINK: origen:", link.source.name, " target: ", link.target.name);
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
            function click(d) {
                if (d3.event.defaultPrevented) return; // click suppressed

                //Compute children data (quantity and how many with each toxicity) before collapsing the node
                var descendantsData = getDescendants(d);

                d.numberOfDescendants = descendantsData.children;
                d.descendantsWithToxicity0 = descendantsData.toxicity0;
                d.descendantsWithToxicity1 = descendantsData.toxicity1;
                d.descendantsWithToxicity2 = descendantsData.toxicity2;
                d.descendantsWithToxicity3 = descendantsData.toxicity3;

                //Hides/Shows and recomputes the position when collapsing or uncollapsing a node
                d = toggleChildren(d);
                update(d, false);
            }

            function zoomToNode(d) {
                d3.select('g').transition()
                    .duration(duration)
                    .attr("transform", "translate(" + d3.event.transform.x + "," + (d3.event.transform.y + ")"));
            }

            function clickLink(l) {
                if (d3.event.defaultPrevented) return; // click suppressed
                //console.log("Link clicked");
                centerLink(l);
            }

            /* SECTION TO DRAW TARGETS */

            /**
             * Draw an image on the left side of a node displaced by object.x pixels
             *
             * @param {d3-node} nodeEnter Node to which we append the image
             * @param {object} object The object of a property
             * @param {string} path The path of the image
             * */
            function drawObjectTargetOutside(nodeEnter, object, path) {
                nodeEnter.append("image")
                    .attr('class', object.class)
                    .attr('id', object.id)
                    .attr("x", function (d) {
                        return object.x - d.radius;
                    })
                    .attr("y", object.y)
                    .attr("height", object.height)
                    .attr("width", object.width)
                    .attr("href", path + object.fileName)
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;
                        return retrieveAttributeFromCommentRadial(d, object.name);
                    });
            }

            /**
             * Call to draw all the targets
             *
             * @param {d3-node} nodeEnter Node to which we append the image
             * @param {string} path The path of the image
             * @param {array} enabledTargets The array containing which checkboxes are selected
             * @param {object} target The object containing the objects to draw
             * @param {callback} draw The function to call to draw the object
             * @param {number} percentage The percentage of the difference of radii between the node and the image
             * */
            function drawTargetsGeneral(nodeEnter, path, enabledTargets, target, draw, percentage = imgRatioPopup) {
                if (enabledTargets.indexOf("target-group") > -1) draw(nodeEnter, target.group, path, percentage);
                if (enabledTargets.indexOf("target-person") > -1) draw(nodeEnter, target.person, path, percentage);
                if (enabledTargets.indexOf("target-stereotype") > -1) draw(nodeEnter, target.stereotype, path, percentage);
            }

            /**
             * Draws the 3 targets of a node if the checkbox is checked
             * and if the node has that target (sets the opacity to visible)
             *
             * The icon used is from the local path passed by parameter
             * The css values are from the target objects that are icons
             * */
            function drawTargetsOutside(nodeEnter, localPath, enabledTargets) {
                removeThisTargets(nodeEnter);

                let path = pathTargetsPopup + localPath;
                let target = {group: objTargetGroup, person: objTargetPerson, stereotype: objTargetStereotype};
                drawTargetsGeneral(nodeEnter, path, enabledTargets, target, drawObjectTargetOutside);
            }

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
                var cbShowTargets = [enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];
                var listOpacity;
                var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

                for (let i = 0; i < targets.length; i++) {
                    if (cbShowTargets[i] > -1) {
                        nodeEnter.filter(function (d) {
                            if (d.parent === undefined) {
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
                            .attr("height", 40)
                            .attr("width", 40)
                            .attr("href", pathTargetsPopup + localPath + targets[i].fileName)
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
                            drawTargetsOutside(nodeEnter, "icons/", enabledTargets);
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
             *
             * Draw in a triangle Group --- Stereotype
             *                          \ /
             *                         Person
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
                                return d.radius * targets[i].xInside;
                            })
                            .attr("y", function (d) {
                                return d.radius * targets[i].yInside;
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

            function drawTargetGroup(nodeEnter) {
                // TARGET GROUP
                nodeEnter.append("image")
                    .attr('class', 'targetGroup')
                    .attr('id', 'targetGroup')
                    .attr("x", -20) //NOTE: it is always displayed at the left side!!
                    .attr("y", -10)
                    .attr("height", 15)
                    .attr("width", 15)
                    .attr("href", listTargetImgPath[0])
                    .attr("opacity", function (d) {
                        if (d.target_group) return 1
                        return 0 //We need to set the opacity or it will always be displayed!
                    });
                groupDrawn = true;
            }

            function drawTargetPerson(nodeEnter) {
                nodeEnter.append("image")
                    .attr('class', 'targetPerson')
                    .attr('id', 'targetPerson')
                    .attr("x", -40) //NOTE: it is always displayed at the left side!!
                    .attr("y", -10)
                    .attr("height", 15)
                    .attr("width", 15)
                    .attr("href", listTargetImgPath[1])
                    .attr("opacity", function (d) {
                        if (d.target_person) return 1
                        return 0
                    });
                personDrawn = true;
            }

            function drawTargeStereotype(nodeEnter) {

                nodeEnter.append("image")
                    .attr('class', 'targetStereotype')
                    .attr('id', 'targetStereotype')
                    /*.attr("x", radialPoint(source.x0 - 70, source.y0 - 10)[0] ) //NOTE: it is always displayed at the inside side!!
                .attr("y",  radialPoint(source.x0 - 70, source.y0 - 10)[1])*/
                    .attr("x", -60) //NOTE: it is always displayed at the inside side!!
                    .attr("y", -10)
                    .attr("height", 15)
                    .attr("width", 15)
                    .attr("href", listTargetImgPath[2])
                    .attr("opacity", function (d) {
                        if (d.stereotype) return 1
                        return 0
                    });
            }

            function visualiseTargets(nodeEnter) {
                enabledTargets.indexOf("target-group") > -1 ? drawTargetGroup(nodeEnter) : d3.selectAll("#targetGroup").remove();
                enabledTargets.indexOf("target-person") > -1 ? drawTargetPerson(nodeEnter) : d3.selectAll("#targetPerson").remove();
                enabledTargets.indexOf("target-stereotype") > -1 ? drawTargeStereotype(nodeEnter) : d3.selectAll("#targetStereotype").remove();
            }

            function removeTargets() {
                d3.selectAll("#targetGroup").remove();
                d3.selectAll("#targetPerson").remove();
                d3.selectAll("#targetStereotype").remove();
            }

            /* SECTION: Draw features*/

            /**
             * Draws a circle in an horizontal line at the right of the node
             *
             * @param {d3-node} nodeEnter Node to which we append the image
             * @param {object} object The object of a property
             * @param {number} itemOrder Order in which the circles is drawn (away from the node)
             * */
            function drawObjectAsDot(nodeEnter, object, itemOrder) {
                nodeEnter.append("circle")
                    .attr('class', object.class)
                    .attr('id', object.id)
                    .attr("r", dotRadiusPopup)
                    .attr("transform", function (d) {
                        return "translate(" + (d.radius + (itemOrder + 1) * (dotRadiusPopup * 2)) + "," + 0 + ")";
                    })
                    .attr("fill", object.color)
                    .style("stroke", "black")
                    .style("stroke-width", "1.5px")
                    .attr("opacity", function (d) {
                        if (d.parent === undefined) return 0;
                        return retrieveAttributeFromCommentRadial(d, object.name);
                    });
            }

            /**
             * Draw features as dots
             * */
            function drawFeatureDots(nodeEnter, enabledFeatures) {
                removeThisFeatures(nodeEnter);
                removeToxicities(nodeEnter); //Remove all the pngs for toxicity

                let index = 0;
                if (enabledFeatures.indexOf("argumentation") > -1) drawObjectAsDot(nodeEnter, objFeatArgumentation, index);
                if (enabledFeatures.indexOf("constructiveness") > -1) drawObjectAsDot(nodeEnter, objFeatConstructiveness, ++index);

                if (enabledFeatures.indexOf("sarcasm") > -1) drawObjectAsDot(nodeEnter, objFeatSarcasm, ++index);
                if (enabledFeatures.indexOf("mockery") > -1) drawObjectAsDot(nodeEnter, objFeatMockery, ++index);
                if (enabledFeatures.indexOf("intolerance") > -1) drawObjectAsDot(nodeEnter, objFeatIntolerance, ++index);

                if (enabledFeatures.indexOf("improper_language") > -1) drawObjectAsDot(nodeEnter, objFeatImproper, ++index);
                if (enabledFeatures.indexOf("insult") > -1) drawObjectAsDot(nodeEnter, objFeatInsult, ++index);
                if (enabledFeatures.indexOf("aggressiveness") > -1) drawObjectAsDot(nodeEnter, objFeatAggressiveness, ++index);
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
             * Delete the features of the node
             * Redraw the features of the node
             *
             * Deleting the features firts helps us when the selected dropdown menu option changes
             * */
            function drawFeatureDots(nodeEnter) {
                removeThisFeatures(nodeEnter);
                removeToxicities(nodeEnter); //Remove all the pngs for toxicity

                var cbFeatureEnabled = [enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
                    enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
                    enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

                var features = [objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
                var listOpacity;

                for (var i = 0; i < 8; i++) {
                    if (cbFeatureEnabled[i] > -1) {
                        nodeEnter.filter(function (d) {
                            if (d.parent === undefined) {
                                return false;
                            } else {
                                listOpacity = [d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                                return listOpacity[i];
                            }
                        }).append("circle")
                            .attr('class', features[i].class)
                            .attr('id', features[i].id)
                            .attr("r", dotRadiusPopup)
                            .attr("transform", function (d) {
                                return "translate(" + (d.radius + (i + 1) * (dotRadiusPopup * 2)) + "," + 0 + ")"
                            })
                            .attr("fill", colorFeature[i])
                            .style("stroke", "black")
                            .style("stroke-width", "1.5px")
                    }
                }

            }


            function drawFeatureAsCheese(nodeEnter, localPath) {
                removeThisFeatures(nodeEnter);
                removeToxicities(nodeEnter); //Remove all the pngs for toxicity

                //Add the gray cheese
                nodeEnter.filter(function (d) {
                    return d.parent !== undefined;
                }).append("image")
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
                            if (d.parent === undefined) {
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
                //removeThisTargets(nodeEnter);
                removeToxicities(nodeEnter);

                var allObjectsInNode = [objToxicity0, objToxicity1, objToxicity2, objToxicity3,
                    objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness,
                    //objTargetGroup, objTargetPerson, objTargetStereotype
                ];
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
                            .style("stroke-width", "1.5px")
                            .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                            .attr("opacity", function (d) {
                                if (d.parent === undefined) return 0;

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
                            .style("stroke-width", "1.5px")
                            .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
                            .attr("opacity", function (d) {
                                if (d.parent === undefined) return 0;

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
                            if (d.parent === undefined) {
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
                            .style("stroke-width", "1.5px")
                            .attr("href", pathFeatures + localPath + allObjectsInNode[i].fileName)
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
                var localPosition;
                // cbFeatureInside.checked ? localPosition = -10 : localPosition = 30;

                switch (option) {
                    case "dots":
                        selectTargetVisualization(nodeEnter); //draw the targets if necessary
                        drawFeatureDots(nodeEnter, enabledFeatures); //Always drawn on the right side
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
                        drawFeatureAsCircularGlyph(nodeEnter, "NewCircular/", localPosition);
                        selectTargetVisualization(nodeEnter);
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

            function drawFeaturesCheese(nodeEnter) {
                hideFeatureDots();

                var listEnabledVisualization = [0, enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
                    enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
                    enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

                var listCheeseClass = ["grayCheese", "cheeseArgumentation", "cheeseConstructiveness",
                    "cheeseSarcasm", "cheeseMockery", "cheeseIntolerance", "cheeseImproper", "cheeseInsult", "cheeseAggressiveness"];

                var listCheeseOpacity;

                for (var i = 0; i < listCheeseClass.length; i++) {
                    if (listEnabledVisualization[i] > -1) {
                        nodeEnter.append("image")
                            .attr('class', listCheeseClass[i])
                            .attr('id', listCheeseClass[i])
                            .attr("x", cheeseX) //NOTE: it is always displayed at the left side!!
                            .attr("y", cheeseY)
                            .attr("height", cheeseHeight)
                            .attr("width", cheeseWidth)
                            .attr("href", listCheeseImgPath[i])
                            .attr("opacity", function (d) {
                                if (d.parent === undefined) return 0;
                                listCheeseOpacity = [0.5, d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                                return listCheeseOpacity[i];
                            });
                    }
                }
            }


            function drawFeatures(nodeEnter) {
                hideCheese();
                // Argumentation
                if (enabledFeatures.indexOf("argumentation") > -1) {
                    nodeEnter.append("circle")
                        .attr('class', 'featureArgumentation')
                        .attr('id', 'featureArgumentation')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 35 + "," + 0 + ")")
                        .attr("fill", colorFeature[0])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.argumentation) return 1 //If node contains argumentation
                            return 0 //We hide it if it has no argumentation
                        });
                }

                if (enabledFeatures.indexOf("constructiveness") > -1) {
                    // Constructiveness
                    nodeEnter.append("circle")
                        .attr('class', 'featureConstructiveness')
                        .attr('id', 'featureConstructiveness')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 45 + "," + 0 + ")")
                        .attr("fill", colorFeature[1])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.constructiveness) return 1
                            return 0
                        });
                }
                if (enabledFeatures.indexOf("sarcasm") > -1) {
                    // Sarcasm
                    nodeEnter.append("circle")
                        .attr('class', 'featureSarcasm')
                        .attr('id', 'featureSarcasm')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 55 + "," + 0 + ")")
                        .attr("fill", colorFeature[2])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.sarcasm) return 1
                            return 0
                        });
                }
                if (enabledFeatures.indexOf("mockery") > -1) {
                    // Mockery
                    nodeEnter.append("circle")
                        .attr('class', 'featureMockery')
                        .attr('id', 'featureMockery')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 65 + "," + 0 + ")")
                        .attr("fill", colorFeature[3])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.mockery) return 1
                            return 0
                        });
                }
                if (enabledFeatures.indexOf("intolerance") > -1) {
                    // Intolerance
                    nodeEnter.append("circle")
                        .attr('class', 'featureIntolerance')
                        .attr('id', 'featureIntolerance')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 75 + "," + 0 + ")")
                        .attr("fill", colorFeature[4])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.intolerance) return 1
                            return 0
                        });
                }

                if (enabledFeatures.indexOf("improper_language") > -1) {
                    // Improper Language
                    // Improper Language
                    nodeEnter.append("circle")
                        .attr('class', 'featureImproperLanguage')
                        .attr('id', 'featureImproperLanguage')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 95 + "," + 0 + ")")
                        .attr("fill", colorFeature[5])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.improper_language) return 1
                            return 0
                        });
                }

                if (enabledFeatures.indexOf("insult") > -1) {
                    // Insult
                    nodeEnter.append("circle")
                        .attr('class', 'featureInsult')
                        .attr('id', 'featureInsult')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 105 + "," + 0 + ")")
                        .attr("fill", colorFeature[6])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.insult) return 1
                            return 0
                        });
                }
                if (enabledFeatures.indexOf("aggressiveness") > -1) {
                    // Aggressiveness
                    nodeEnter.append("circle")
                        .attr('class', 'featureAggressiveness')
                        .attr('id', 'featureAggressiveness')
                        .attr("r", "4.5")
                        .attr("transform", "translate(" + 115 + "," + 0 + ")")
                        .attr("fill", colorFeature[7])
                        .style("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("opacity", function (d) {
                            if (d.aggressiveness) return 1
                            return 0
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
                var listCheeseClass = ["#grayCheese", "#cheeseArgumentation", "#cheeseConstructiveness", "#cheeseSarcasm",
                    "#cheeseMockery", "#cheeseIntolerance", "#cheeseImproper", "#cheeseInsult", "#cheeseAggressiveness"];
                for (var i = 0; i < listCheeseClass.length; i++) d3.selectAll(listCheeseClass[i]).remove();
            }

            /* END section*/

            /**
             * Draw an icon for the root node
             * */
            function visualiseRootIcon(node) {
                //Filter the nodes and append an icon just for the root node
                node.filter(function (d) {
                    return d.parent === undefined;
                }).append("image")
                    .attr('class', objRoot.class)
                    .attr('id', objRoot.id)

                    .attr("x", positionImage(rootPopup.radius, 0))
                    .attr("y", positionImage(rootPopup.radius, 0))
                    .attr("height", sizeImage(rootPopup.radius, 0))
                    .attr("width", sizeImage(rootPopup.radius, 0))
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
                if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
                    node.filter(function (d) {
                        return (!d.positive_stance && !d.negative_stance);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (!d.target.positive_stance && !d.target.negative_stance);
                    }).style("opacity", 1);
                }

                //Positive stance CB is checked
                if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
                    node.filter(function (d) {
                        return (d.positive_stance);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.positive_stance);
                    }).style("opacity", 1);
                }

                //Negative stance CB is checked
                if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
                    node.filter(function (d) {
                        return (d.negative_stance);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.negative_stance);
                    }).style("opacity", 1);
                }

                //Target group CB is checked
                if (enabledHighlight.indexOf("highlight-target-group") > -1) {
                    node.filter(function (d) {
                        return (d.target_group);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.target_group);
                    }).style("opacity", 1);
                }

                //Target person CB is checked
                if (enabledHighlight.indexOf("highlight-target-person") > -1) {
                    node.filter(function (d) {
                        return (d.target_person);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.target_person);
                    }).style("opacity", 1);
                }

                //Stereotype CB is checked
                if (enabledHighlight.indexOf("highlight-target-stereotype") > -1) {
                    node.filter(function (d) {
                        return (d.stereotype);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.stereotype);
                    }).style("opacity", 1);
                }

                //Argumentation CB is checked
                if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
                    node.filter(function (d) {
                        return (d.argumentation);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.argumentation);
                    }).style("opacity", 1);
                }

                //Constructiveness CB is checked
                if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
                    node.filter(function (d) {
                        return (d.constructiveness);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.constructiveness);
                    }).style("opacity", 1);
                }

                //Sarcasm CB is checked
                if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
                    node.filter(function (d) {
                        return (d.sarcasm);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.sarcasm);
                    }).style("opacity", 1);
                }

                //Mockery CB is checked
                if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
                    node.filter(function (d) {
                        return (d.mockery);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.mockery);
                    }).style("opacity", 1);
                }
                //Intolerance CB is checked
                if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
                    node.filter(function (d) {
                        return (d.intolerance);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.intolerance);
                    }).style("opacity", 1);
                }
                //Improper language CB is checked
                if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
                    node.filter(function (d) {
                        return (d.improper_language);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.improper_language);
                    }).style("opacity", 1);
                }

                //Insult language CB is checked
                if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
                    node.filter(function (d) {
                        return (d.insult);
                    }).style("opacity", 1);

                    link.filter(function (d) {
                        return (d.target.insult);
                    }).style("opacity", 1);
                }

                //Aggressiveness language CB is checked
                if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
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
                if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) {
                    node.filter(function (d) {
                        return (d.positive_stance || d.negative_stance);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (d.target.positive_stance || d.target.negative_stance);
                    }).style("opacity", opacityValue);
                }

                //Positive stance CB is checked
                if (enabledHighlight.indexOf("highlight-stance-positive") > -1) {
                    node.filter(function (d) {
                        return (!d.positive_stance);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.positive_stance);
                    }).style("opacity", opacityValue);
                }

                //Negative stance CB is checked
                if (enabledHighlight.indexOf("highlight-stance-negative") > -1) {
                    node.filter(function (d) {
                        return (!d.negative_stance);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.negative_stance);
                    }).style("opacity", opacityValue);
                }

                //Target group CB is checked
                if (enabledHighlight.indexOf("highlight-target-group") > -1) {
                    node.filter(function (d) {
                        return (!d.target_group);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.target_group);
                    }).style("opacity", opacityValue);
                }

                //Target person CB is checked
                if (enabledHighlight.indexOf("highlight-target-person") > -1) {
                    node.filter(function (d) {
                        return (!d.target_person);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.target_person);
                    }).style("opacity", opacityValue);
                }

                //Stereotype CB is checked
                if (enabledHighlight.indexOf("highlight-target-stereotype") > -1) {
                    node.filter(function (d) {
                        return (!d.stereotype);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.stereotype);
                    }).style("opacity", opacityValue);
                }

                //Argumentation CB is checked
                if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) {
                    node.filter(function (d) {
                        return (!d.argumentation);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.argumentation);
                    }).style("opacity", opacityValue);
                }

                //Constructiveness CB is checked
                if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) {
                    node.filter(function (d) {
                        return (!d.constructiveness);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.constructiveness);
                    }).style("opacity", opacityValue);
                }

                //Sarcasm CB is checked
                if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) {
                    node.filter(function (d) {
                        return (!d.sarcasm);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.sarcasm);
                    }).style("opacity", opacityValue);
                }

                //Mockery CB is checked
                if (enabledHighlight.indexOf("highlight-features-mockery") > -1) {
                    node.filter(function (d) {
                        return (!d.mockery);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.mockery);
                    }).style("opacity", opacityValue);
                }
                //Intolerance CB is checked
                if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) {
                    node.filter(function (d) {
                        return (!d.intolerance);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.intolerance);
                    }).style("opacity", opacityValue);
                }
                //Improper language CB is checked
                if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) {
                    node.filter(function (d) {
                        return (!d.improper_language);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.improper_language);
                    }).style("opacity", opacityValue);
                }

                //Insult language CB is checked
                if (enabledHighlight.indexOf("highlight-features-insult") > -1) {
                    node.filter(function (d) {
                        return (!d.insult);
                    }).style("opacity", opacityValue);

                    link.filter(function (d) {
                        return (!d.target.insult);
                    }).style("opacity", opacityValue);
                }

                //Aggressiveness language CB is checked
                if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) {
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
                    nodesPopup.forEach(function (d) {
                        d.highlighted = 1;
                    });
                    node.style("opacity", 1);
                } else { //If some tag checkbox is selected behave as expected
                    //First, unhighlight everything and set the parameter highlighted to 0
                    nodesPopup.forEach(function (d) {
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
                nodesPopup.forEach(function (d) {
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
             * Write tooltip text in a table with bold lyrics if the feature is present
             * */
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
                tooltipTextPopup = "<table>";

                for (i = 0; i < jsonValues.length; i++) {
                    if (i === 3 || i === 12) tooltipTextPopup += "<tr><td></td></tr>"; // I want a break between the first line and the features and the targets
                    if (i % 3 === 0) tooltipTextPopup += "<tr>"; //Start table line
                    if (i < 3) tooltipTextPopup += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>"; //First ones without bold
                    else if (jsonValues[i] !== -1) jsonValues[i] ? tooltipTextPopup += "<td><b>" + jsonNames[i] + ": " + jsonValues[i] + "</b></td>" : tooltipTextPopup += "<td>" + jsonNames[i] + ": " + jsonValues[i] + "</td>";
                    if ((i + 1) % 3 === 0) tooltipTextPopup += "</tr>"; //End table line
                }

                tooltipTextPopup += "</table>";

                tooltipTextPopup += "<br> <table>";
                //If node is collapsed, we also want to add some information about its sons
                if (d._children) {
                    var sonTitles = ["Direct comments", "Total number of generated comments", "Not toxic", "Mildly toxic", "Toxic", "Very toxic"];
                    var sonValues = [d._children.length, d.numberOfDescendants, d.descendantsWithToxicity0, d.descendantsWithToxicity1, d.descendantsWithToxicity2, d.descendantsWithToxicity3];

                    for (i = 0; i < sonValues.length; i++) {
                        if (i % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
                        tooltipTextPopup += "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                        if ((i + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
                    }

                }
                tooltipTextPopup += "</table>";
                tooltipTextPopup += "<br>" + d.coment;
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
                tooltipTextPopup = "<table>";
                tooltipTextPopup += "<br> <table>";

                for (i = 0; i < sonValues.length; i++) {
                    if (i % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
                    tooltipTextPopup +=
                        "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                    if ((i + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
                }

                tooltipTextPopup += "</table>";


            }


            function update(source, first_call) {

                // Compute the new tree layout.
                nodesPopup = tree.nodes(rootPopup).reverse();
                var links = tree.links(nodesPopup);

                const firstLevelEdgeLength = Math.max(
                    (rootPopup.children?.length || rootPopup._children?.length) * minNodeRadiusPopup / Math.PI,
                    480);
                // Set widths between levels
                nodesPopup.forEach(function (d) {
                    let computedRadius = firstLevelEdgeLength + (d.depth - 1) * edgeLengthPopup;

                    //if (d.depth === 1) //console.log("First y: ", firstLevelEdgeLength, computedRadius);
                    d.depth === 1 ? d.y = firstLevelEdgeLength : d.y = computedRadius;
                });

                // Update the nodes…
                nodePopup = svgGroup.selectAll("g.node")
                    .data(nodesPopup, function (d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = nodePopup.enter().append("g")
                    .filter(function (d) {
                        return d;
                    })
                    .attr("class", "node")
                    .attr("transform", function (d) {
                        return "translate(" + radialPoint(source.x0, source.y0) + ")";
                    })
                    .on('click', function (d) {
                        click(d);
                    })
                    .on('mouseover', function (d) {
                        //console.log("Before transforming coordenates: ", source.x0, source.y0);
                        var highlighted_nodes = nodePopup.filter(function (n) {
                            return n.highlighted;
                        })[0].map(i => i.__data__.name); // don't ask..
                        if (d !== rootPopup && highlighted_nodes.includes(d.name)) {
                            writeTooltipText(d);
                            tooltip.style("visibility", "visible")
                                .html(tooltipTextPopup);
                        } else if (d == rootPopup) {
                            writeTooltipRoot(d);
                            tooltip.style("visibility", "visible").html(tooltipTextPopup);
                        }
                    })
                    .on("mousemove", function (d) {
                        // if (d !== root) {
                        return tooltip.style("top", (d3.mouse(document.querySelector(".overlay-popup"))[1] - 30) + "px").style("left", (d3.mouse(document.querySelector(".overlay-popup"))[0] - 440) + "px");
                        // }
                    })
                    .on("mouseout", function () {
                        return tooltip.style("visibility", "hidden");
                    });

                nodeEnter.append("circle")
                    .attr('class', 'nodeCircle')
                    .attr("r", circleRadius)
                    .style("stroke", "black")
                    .style("stroke-width", 0.5);

                //Dropdown menus
                // dropdownTargets.addEventListener("change", function () {
                //     selectTargetVisualization(nodeEnter);
                // });
                // dropdownFeatures.addEventListener("change", function () {
                //     selectFeatureVisualization(nodeEnter);
                // });

                function featureVisualizationListener() {
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
                        dotsFeatures.removeEventListener("change", featureVisualizationListener);
                        glyphsFeatures.removeEventListener("change", featureVisualizationListener);
                    }
                }

                if (nodeEnter[0].length) {
                    dotsFeatures.addEventListener("change", featureVisualizationListener);
                    glyphsFeatures.addEventListener("change", featureVisualizationListener);
                }

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

                        if (first_call) {
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

                            selectTargetVisualization(nodeEnter);
                            selectFeatureVisualization(nodeEnter);
                        }

                        /*SECTION checkboxes listener*/

                        function checkboxesTargetsListener(event) {
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

                        function checkboxesListener(event) {
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

                        function checkboxesHighlightGroupORListener(event) {
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
                                    checkboxOR.checked ? highlightNodesByPropertyOR(nodePopup, linkPopup) : highlightNodesByPropertyAND(nodePopup, linkPopup);
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

                        function checkboxesHighlightGroupANDListener(event) {
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
                                    checkboxAND.checked ? highlightNodesByPropertyAND(nodePopup, linkPopup) : highlightNodesByPropertyOR(nodePopup, linkPopup);
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

                        // To notify the DOM that the ready function has finished executing.
                        // This to be able to manage the filters if it is given the case that the code of the onLoad function finishes before.
                        const event = new Event('codeReady');

                        // Dispatch the event.
                        document.querySelector("body").dispatchEvent(event);

                        codeReadyPopup = true;
                    });
                } catch (TypeError) {
                    console.error("Error attaching buttons... trying again...");
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
                }

                checkboxesPropertyFeature.forEach(function (checkboxItem) {
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
                // selectFeatureVisualization(nodeEnter);

                //Listener related to the visualization of features
                // checkboxFeatureMenu.addEventListener('change', function () {
                //     if (this.checked) { //Enable checkboxes and dropdown menu + show features if they are selected
                //         checkboxesPropertyFeature.forEach(function (checkboxItem) {
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
                //
                //         if (!document.querySelector("input[value=dot-feat]").checked && !document.querySelector("input[value=cheese-feat]").checked) {
                //             document.querySelector("input[value=dot-feat]").checked = true;
                //         }
                //
                //         // if (!document.querySelector("input[value=on-node]").checked && !document.querySelector("input[value=node-outside]").checked) {
                //         //     document.querySelector("input[value=on-node]").checked = true;
                //         // }
                //         selectFeatureVisualization(nodeEnter);
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
                //
                //         checkButtons.forEach(function (button) {
                //                 button.setAttribute('disabled', 'disabled');
                //             }
                //         );
                //
                //         removeAllFeatures(); //Hide all features when the cb is unchecked
                //     }
                // });

                // if DOT is checked, uncheck OR
                // cbFeatureInside.addEventListener('change', function () {
                //     this.checked ? cbFeatureOutside.checked = false : cbFeatureOutside.checked = true;
                //     selectFeatureVisualization(nodeEnter);
                // });
                // // if CHEESE is checked, uncheck AND
                // cbFeatureOutside.addEventListener('change', function () {
                //     this.checked ? cbFeatureInside.checked = false : cbFeatureInside.checked = true;
                //     selectFeatureVisualization(nodeEnter);
                // });

                // Use Array.forEach to add an event listener to each checkbox.
                // Draw feature circles


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
                //         if (!document.querySelector("input[value=and-group]").checked && !document.querySelector("input[value=or-group]").checked) {
                //             document.querySelector("input[value=and-group]").checked = true;
                //             highlightNodesByPropertyAND(node, link);
                //         } else {
                //             checkboxAND.checked ? highlightNodesByPropertyAND(node, link) : highlightNodesByPropertyOR(node, link);
                //             console.log(enabledHighlight);
                //         }
                //
                //     } else { //We make all nodes and links visible again
                //         checkboxesProperty.forEach(function (checkboxItem) {
                //             checkboxItem.setAttribute('disabled', 'disabled');
                //         });
                //         checkboxesHighlightGroup.forEach(function (checkboxItem) {
                //             checkboxItem.setAttribute('disabled', 'disabled');
                //         });
                //         node.style("opacity", 1);
                //         link.style("opacity", 1);
                //     }
                // });

                // If AND is selected, uncheck the OR and highlight by property AND
                function checkboxANDListener() {
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            if (this.checked) {
                                checkboxOR.checked = false;

                                enabledHighlight =
                                    Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                                highlightNodesByPropertyAND(nodePopup, linkPopup);
                            } else {
                                checkboxOR.checked = true;
                                enabledHighlight =
                                    Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                                highlightNodesByPropertyOR(nodePopup, linkPopup);
                            }
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxAND.removeEventListener("change", checkboxANDListener);
                    }
                }

                if (nodeEnter[0].length) {
                    checkboxAND.addEventListener("change", checkboxANDListener);
                }

                function checkboxORListener() {
                    console.log("testor")
                    if (nodeEnter[0].length) {
                        Object.keys(nodeEnter[0]).forEach(key => {
                            if (!nodeEnter[0][key].viewportElement) nodeEnter[0][key] = null;
                        });

                        nodeEnter = nodeEnter.filter(function (d) {
                            return d;
                        })

                        if (nodeEnter[0].length) {
                            if (this.checked) {
                                checkboxAND.checked = false;

                                enabledHighlight =
                                    Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                                highlightNodesByPropertyOR(nodePopup, linkPopup);
                            } else {
                                checkboxAND.checked = true;
                                enabledHighlight =
                                    Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                                highlightNodesByPropertyAND(nodePopup, linkPopup);
                            }
                        }
                    }
                    if (!nodeEnter[0].length) {
                        checkboxOR.removeEventListener("change", checkboxORListener);
                    }
                }

                // If OR is selected, uncheck the AND and highlight by property OR
                if (nodeEnter[0].length) {
                    checkboxOR.addEventListener("change", checkboxORListener);
                }

                d3.select("#zoom_in_icon").on("click", function () {
                    currentScale = Math.min(3.0, zoomListenerRadial.scale() + 0.1);

                    zoomListenerRadial.scale(currentScale)
                        // .translate([2200 - currentX - currentScale, 900 - currentY - currentScale])
                        .event(svgGroup);
                    console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_in', ' | [Date]', Date.now());

                });
                d3.select("#zoom_out_icon").on("click", function () {
                    currentScale = Math.max(0.1, currentScale - 0.1);

                    zoomListenerRadial.scale(currentScale)
                        // .translate([2200 - currentX + currentScale, 900 - currentY + currentScale])
                        .event(svgGroup);
                    console.log('[User]', user.split('/')[2], '| [interaction]', 'zoom_out', ' | [Date]', Date.now());
                });

                d3.select("#zoom_reset_icon").on("click", function () {
                    currentScale = 0.4;

                    zoomListenerRadial.scale(currentScale)
                        .translate([currentX - currentScale, currentY - currentScale])
                        .event(svgGroup);
                    console.log('[User]', user.split('/')[2], '| [interaction]', 'reset_zoom', ' | [Date]', Date.now());

                });


                /*END SECTION checkboxes listener*/

                /* NOTE: the nodes that get to the function update()
            are root and the ones that were collapsed
            Therefore, for this nodes that are getting uncollapsed we want to:
            - show the targets if necessary
            - show the features if necessary
            - highlight nodes and edges
            * */
                if (!first_call) {
                    selectTargetVisualization(nodeEnter);
                    selectFeatureVisualization(nodeEnter);
                }
                // checkboxFeatureMenu.checked ? selectFeatureVisualization(nodeEnter) : removeAllFeatures();

                // Change the circle fill depending on whether it has children and is collapsed
                nodePopup.select("circle.nodeCircle")
                    .attr("r", function (d) {
                        return computeNodeRadiusRadial(d);
                    })
                    .style("fill", function (d) { //Colour the node according to its level of toxicity
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
                    .style("stroke-width", getEdgeStrokeWidth());

                visualiseRootIcon(nodePopup); //Draw an icon for the root node

                // Transition nodes to their new position.
                var nodeUpdate = nodePopup.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                    });


                // Transition exiting nodes to the parent's new position.
                var nodeExit = nodePopup.exit().transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.name + 50) + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 0);


                // Update the links…
                linkPopup = svgGroup.selectAll("path.link")
                    .data(links, function (d) {
                        return d.target.id;
                    });

                // Enter any new links at the parent's previous position.
                linkPopup.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = {x: source.x0, y: source.y0 * 2};
                        return diagonal({source: o, target: o});
                    })
                    .style("stroke", function (d) {
                        if (d.target.positive_stance && d.target.negative_stance) return colourBothStances; //Both against and in favour
                        else if (d.target.positive_stance === 1) return colourPositiveStance; //In favour
                        else if (d.target.negative_stance === 1) return colourNegativeStance; //Against
                        else return colourNeutralStance; //Neutral comment
                    })
                    .on('click', clickLink)
                    .style("stroke-width", getEdgeStrokeWidth());

                // Transition links to their new position.
                linkPopup.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                //Highlight nodes if necessary NOTE: it needs to be after the definition of the link
                // if (checkboxHighlightMenu.checked && source.children) checkboxOR.checked ? highlightNodesByPropertyOR(node, link) : highlightNodesByPropertyAND(node, link);
                checkboxAND.checked ? highlightNodesByPropertyAND(nodePopup, linkPopup) : highlightNodesByPropertyOR(nodePopup, linkPopup);

                // Transition exiting nodes to the parent's new position.
                linkPopup.exit().transition()
                    .duration(duration)
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                    .remove();

                // Stash the old positions for transition.
                nodesPopup.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            // Append a group which holds all nodes and which the zoom Listener can act upon.
            var svgGroup = baseSvg.append("g");

            // Define the root position
            rootPopup.x0 = 0;
            rootPopup.y0 = 0;

            // Graph statistics information is displayed by default;
            update(rootPopup, true);

            function initPositionRadialPopup() {
                zoomListenerRadial.scale(initialZoomScalePopup);
                zoomListenerRadial.translate([initialCanvasWidthPopup / 4, initialCanvasHeightPopup / 2]);
                zoomListenerRadial.event(baseSvg);
            }

            initPositionRadialPopup();

            //Set initial stroke widths
            linkPopup.style("stroke-width", 11); //Enlarge stroke-width on zoom out
            nodePopup.select("circle.nodeCircle").style("stroke-width", 3); //Enlarge stroke-width on zoom out

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

            console.log('[User]', user.split('/')[2], '| [interaction]', 'Radial_layout_loaded', ' | [Date]', Date.now());
        }

        /*********************
         *       CIRCLE       *
         **********************/

        function createCircleGraph() {

            rootPopup = treeData; //Define the root

            let svg = d3v4.select(popup_container)
                .append("svg")
                .attr("id", "graph-container")
                .attr("width", 300)
                .attr("height", 300)
                .attr("viewBox", "0 0 300 300")
                .attr("style", "overflow: visible; margin: 100px auto auto 126px;")


            let diameter = svg.attr("width"),
                g = svg.append("g").attr("transform", "translate(2,2)"),
                format = d3v4.format(",d");

            let pack = d3v4.pack()
                .size([diameter - 2, diameter - 2])
                .padding(3);

            // Hover rectangle in which the information of a node is displayed
            var tooltip = d3v4.select(popup_container)
                .append("div")
                .attr("id", "my-tooltip")
                .attr("class", "my-tooltip") //add the tooltip class
                .style("position", "absolute")
                .style("z-index", "60")
                .style("visibility", "hidden");

            const colourToxicity0 = "#f7f7f7", colourToxicity1 = "#cccccc", colourToxicity2 = "#737373",
                colourToxicity3 = "#000000", colourNewsArticle = "#C8EAFC", colourCollapsed1Son = "lightsteelblue";

            const minOpacityValue = 0.2, maxOpacityValue = 1;

            // shadow filter //
            const defs = svg.append("defs");

            document.getElementById("graph-container").style.width = "65%";
            document.getElementById("graph-container").style.height = "65%";

            let filter = defs.append("filter")
                .attr("id", "dropshadow")

            filter.append("feDropShadow")
                .attr("flood-opacity", 1)
                .attr("dx", 0)
                .attr("dy", 1)

            /*SECTION checkboxes*/
            //Check the values of the checkboxes and do something
            var checkbox = document.querySelector("input[name=cbTargets]");
            var checkboxesTargets = [document.getElementById("target-group"), document.getElementById("target-person"), document.getElementById("target-stereotype")];
            let enabledTargets = []; //Variable which contains the string of the enabled options to display targets

            // Select all checkboxes with the name 'cbFeatures' using querySelectorAll.
            var checkboxes = document.querySelectorAll("input[type=checkbox][name=cbFeatures]");
            let enabledFeatures = []; //Variable which contains the string of the enabled options to display features

            // Select how to display the features: svg circles or trivial cheese (previous version)
            var checkboxesPropertyFeature = document.querySelectorAll("input[type=checkbox][name=cbFeatureProperty]");

            //Dropdown menu
            var checkboxesPositioningFeature = document.querySelectorAll("input[type=checkbox][name=cbFeaturePositioning]");

            // Select which properties and if an intersection or union of those
            var checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
            var checkboxAND = document.querySelector("input[type=radio][name=cbHighlightProperty][value=and-group]");
            var checkboxOR = document.querySelector("input[type=radio][name=cbHighlightProperty][value=or-group]");
            var checkboxesHighlightGroupOR = document.querySelectorAll("input[name=cbHighlightOR]");
            var checkboxesHighlightGroupAND = document.querySelectorAll("input[name=cbHighlightAND]");

            let enabledHighlight = []; //Variable which contains the string of the enabled options to highlight


            rootPopup = d3v4.hierarchy(rootPopup)
                .sum(function (d) {
                    switch (d.comment_level) {
                        case 1:
                            return 15;
                        case 2:
                            return 8;
                        default:
                            return 5;
                    }
                })
                .sort(function (a, b) {
                    return b.comment_level - a.comment_level;
                });

            var node = g.selectAll(".node")
                .data(pack(rootPopup).descendants())
                .enter().append("g")
                .attr("class", function (d) {
                    return d.children ? "node" : "leaf node";
                })
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })

            nodesPopup = flatten(rootPopup); //get nodes as a list


            //node.append("title")
            //  .text(function(d) { return d.data.name + "\n" + format(d.value); });
            //
            node.append("circle")
                .attr("r", function (d) {
                    if (d.depth === 0) {
                        return d.r;
                    }
                    if (d.children) {
                        if (d.children.length === 1) {
                            // return ((d.r + ((d.r * (1 / d.depth)))));
                            return d.r + (d.r * (0.3 / d.depth));

                        } else {
                            return d.r;
                        }
                    } else {
                        return d.r;
                    }
                })
                .attr("filter", "url(#dropshadow)")
                .style("fill", function (d) {
                    if (d.data.toxicity_level === 0) return colourToxicity0;
                    else {
                        switch (d.data.toxicity_level) {
                            //case 0:
                            //return colourToxicity0;
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
                }).style("stroke", "black")
                .on("mouseover", function (d) {
                    if (d !== rootPopup) {
                        writeTooltipText(d.data, d.depth);
                        tooltip.style("visibility", "visible").html(tooltipTextPopup);
                    } else {
                        writeTooltipRoot(d.data, d.depth);
                        tooltip.style("visibility", "visible").html(tooltipTextPopup);
                    }
                })
                .on("mousemove", function (d) {
                    // if (d !== root) {
                    return tooltip.style("top", (d3v4.mouse(document.querySelector(popup_container))[1] - 45) + "px").style("left", (d3v4.mouse(document.querySelector(popup_container))[0] - 460) + "px");
                    // }
                })
                .on("mouseout", function () {
                    return tooltip.style("visibility", "hidden");
                });
            //    .on("mouseover", function(d){  console.log(d)
            //        return tooltip.text(d.data.name).style("visibility", "visible").html("tooltip");})
            //    .on("mousemove", function(){return tooltip.style("top", d3v4.event.pageY -30 +"px").style("left",d3v4.event.pageX + 480 +"px");})
            //    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

            //I compute the values for the statistic data showing in the background
            var listStatistics = getStatisticValues(rootPopup);
            var totalNumberOfNodes = listStatistics.children;

            var totalNotToxic = listStatistics.toxicity0,
                totalMildlyToxic = listStatistics.toxicity1,
                totalToxic = listStatistics.toxicity2,
                totalVeryToxic = listStatistics.toxicity3;

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
                tooltipTextPopup = "<table>";
                tooltipTextPopup += "<table>";

                for (i = 0; i < sonValues.length; i++) {
                    if (i % 2 === 0) tooltipTextPopup += "<tr>"; //Start table line
                    tooltipTextPopup +=
                        "<td>" + sonTitles[i] + ": " + sonValues[i] + "</td>";
                    if ((i + 1) % 2 === 0) tooltipTextPopup += "</tr>"; //End table line
                }

                tooltipTextPopup += "<br> <table>";
            }

            function writeTooltipText(d, depth) {
                //I want to show Argument and Constructiveness in one line, I add a dummy space to keep that in the loop
                var jsonValues = [
                    d.name,
                    d.toxicity_level,
                    depth,
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

            function hovered(hover) {
                return function (d) {
                    d3v4.selectAll(d.ancestors().map(function (d) {
                    }));
                };
            }

//Functions to highlight/unhighlight
            function highlightNodesByPropertyOR(node, enabledHighlight) {
                //If no tag (toxicity, stance,...) checkbox is selected: highlight all
                if (enabledHighlight.length === 0) {
                    nodesPopup.forEach(function (d) {
                        d.data.highlighted = 1;
                    });
                    node.style("opacity", maxOpacityValue);
                } else { //If some tag checkbox is selected behave as expected
                    //First, unhighlight everything
                    nodesPopup.forEach(function (d) {
                        d.data.highlighted = 0;
                    });
                    node.style("opacity", minOpacityValue);

                    //Then highlight if the node has the property
                    highlightByToxicity(node, enabledHighlight, highlightNode);
                    highlightByFeature(node, enabledHighlight, highlightNode);
                    highlightByStance(node, enabledHighlight, highlightNode);
                    highlightByTarget(node, enabledHighlight, highlightNode);
                }
                node.filter(function (d) {
                    let result = d.depth === 0;
                    if (result) {
                        d.data.highlighted = 1;
                    }
                    return result;
                }).style("opacity", maxOpacityValue);

            }

            function highlightNodesByPropertyAND(node, enabledHighlight) {
                //First, highlight everything
                nodesPopup.forEach(function (d) {
                    d.data.highlighted = 1;
                });
                node.style("opacity", maxOpacityValue);

                //Then unhighlight if the node does not have the property
                highlightByToxicity(node, enabledHighlight, unhighlightNode);
                highlightByFeature(node, enabledHighlight, unhighlightNode);
                highlightByStance(node, enabledHighlight, unhighlightNode);
                highlightByTarget(node, enabledHighlight, unhighlightNode);
                node.filter(function (d) {
                    let result = d.depth === 0;
                    if (result) {
                        d.data.highlighted = 1;
                    }
                    return result;
                }).style("opacity", maxOpacityValue);

            }

            try {
                $(document).ready(function () {
                    checkboxAND.addEventListener("change", function () {
                        if (this.checked) {
                            checkboxOR.checked = false;

                            enabledHighlight =
                                Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                            highlightNodesByPropertyAND(node, enabledHighlight);
                        } else {
                            checkboxOR.checked = true;
                            enabledHighlight =
                                Array.from(checkboxesHighlightGroupOR) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                            highlightNodesByPropertyOR(node, enabledHighlight);
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
                            highlightNodesByPropertyOR(node, enabledHighlight);
                        } else {
                            checkboxAND.checked = true;
                            enabledHighlight =
                                Array.from(checkboxesHighlightGroupAND) // Convert checkboxes to an array to use filter and map.
                                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                                    .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                            highlightNodesByPropertyAND(node, enabledHighlight);
                        }
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
                                console.log("[User]", user.split('/')[2], "| [interaction]", "checking_" + checkboxItem.name + '_' + checkboxItem.value, "| [Date]", Date.now());
                            } else {
                                console.log("[User]", user.split('/')[2], "| [interaction]", "unchecking_" + checkboxItem.name + '_' + checkboxItem.value, " | [Date]", Date.now());
                            }
                            checkboxOR.checked ? highlightNodesByPropertyOR(node, enabledHighlight) : highlightNodesByPropertyAND(node, enabledHighlight);
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
                            checkboxAND.checked ? highlightNodesByPropertyAND(node, enabledHighlight) : highlightNodesByPropertyOR(node, enabledHighlight);
                        })
                    });

                    // To notify the DOM that the ready function has finished executing.
                    // This to be able to manage the filters if it is given the case that the code of the onLoad function finishes before.
                    const event = new Event('codeReady');

                    // Dispatch the event.
                    document.querySelector("body").dispatchEvent(event);

                    codeReadyPopup = true;
                });
            } catch
                (TypeError) {
                console.error("Error attaching buttons... trying again...");
            }
            highlightNodesByPropertyOR(node, enabledHighlight);
            highlightNodesByPropertyAND(node, enabledHighlight);

            //Listeners

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
//         if (!document.querySelector("input[value=and-group]").checked && !document.querySelector("input[value=or-group]").checked) {
//             document.querySelector("input[value=and-group]").checked = true;
//             highlightNodesByPropertyAND(node);
//         } else {
//             checkboxAND.checked ? highlightNodesByPropertyAND(node, enabledHighlight) : highlightNodesByPropertyOR(node, enabledHighlight);
//             console.log(enabledHighlight);
//         }
//
//     } else {
//         console.log("We disable all checkboxes ...");
//         checkboxesProperty.forEach(function (checkboxItem) {
//             checkboxItem.setAttribute('disabled', 'disabled');
//         });
//         checkboxesHighlightGroup.forEach(function (checkboxItem) {
//             checkboxItem.setAttribute('disabled', 'disabled');
//         });
//
//         //We make all nodes and links visible again
//         node.style("opacity", 1);
//         //link.style("opacity", 1);
//     }
// });

// If AND is selected, uncheck the OR and highlight by property AND

            function getLengthFilterByName(array, stringToMatch, matchPositive = true) {
                return Array.from(array).filter(function (val) {
                    if (matchPositive) {
                        return val.includes(stringToMatch);
                    } else {
                        return !val.includes(stringToMatch);
                    }
                }).length;
            }


            /**
             * Return the value of a property (set from the JSON) of the given node
             *
             * @param d Datum of a node
             * @param {string} propertyNameToRetrieve The property whose value is returned
             * */
            function retrieveAttributeFromCommentCircle(d, propertyNameToRetrieve) {
                switch (propertyNameToRetrieve) {
                    //Features
                    case "argumentation":
                        return d.argumentation;
                    case "constructiveness":
                        return d.constructiveness;
                    case "sarcasm":
                        return d.sarcasm;
                    case "mockery":
                        return d.mockery;
                    case "intolerance":
                        return d.intolerance;
                    case "improper_language":
                        return d.improper_language;
                    case "insult":
                        return d.insult;
                    case "aggressiveness":
                        return d.aggressiveness;
                    case "gray":
                        return 1;
                    case "gray-ring":
                        return 0.5;

                    //Targets
                    case "target-group":
                        return d.target_group;
                    case "target-person":
                        return d.target_person;
                    case "target-stereotype":
                        return d.stereotype;

                    //Toxicity
                    case "toxicity-0":
                        return d.toxicity_level === 0 ? 1 : 0;
                    case "toxicity-1":
                        return d.toxicity_level === 1 ? 1 : 0;
                    case "toxicity-2":
                        return d.toxicity_level === 2 ? 1 : 0;
                    case "toxicity-3":
                        return d.toxicity_level === 3 ? 1 : 0;

                    //Stances
                    case "positive":
                        return d.positive_stance;
                    case "negative":
                        return d.negative_stance;
                    case "neutral":
                        return !(d.positive_stance || d.negative_stance);
                    case "both":
                        return d.positive_stance && d.negative_stance;

                    default:
                        //console.log("An attribute could not be retrieved because the key word did not match any case...");
                        return 1;
                }
            }

            function highlightNode(node, attributeName) {
                node.filter(function (d) {
                    let result = retrieveAttributeFromCommentCircle(d.data, attributeName);
                    if (result) {
                        d.data.highlighted = 1;
                    }
                    return result;
                }).style("stroke", "black").style("color", "black").style("opacity", maxOpacityValue);
            }

            function unhighlightNode(node, attributeName) {
                node.filter(function (d) {
                    let result = !retrieveAttributeFromCommentCircle(d.data, attributeName);
                    if (result) {
                        d.data.highlighted = 0;
                    }
                    return result;
                }).style("stroke", "black").style("color", "black").style("opacity", minOpacityValue);
            }

            /**
             * Highlight a node if the checkbox is checked and if the node presents a certain level of toxicity
             * */
            function highlightByToxicity(node, enabledHighlight, changeNodeOpacity) {
                if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) changeNodeOpacity(node, "toxicity-0");
                if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) changeNodeOpacity(node, "toxicity-1");
                if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) changeNodeOpacity(node, "toxicity-2");
                if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) changeNodeOpacity(node, "toxicity-3");
            }

            function highlightByStance(node, enabledHighlight, changeNodeOpacity) {
                if (enabledHighlight.indexOf("highlight-stance-neutral") > -1) changeNodeOpacity(node, "neutral");
                if (enabledHighlight.indexOf("highlight-stance-positive") > -1) changeNodeOpacity(node, "positive");
                if (enabledHighlight.indexOf("highlight-stance-negative") > -1) changeNodeOpacity(node, "negative");
                if (enabledHighlight.indexOf("highlight-both") > -1) changeNodeOpacity(node, "both");
            }

            function highlightByTarget(node, enabledHighlight, changeNodeOpacity) {
                if (enabledHighlight.indexOf("highlight-target-group") > -1) changeNodeOpacity(node, "target-group");
                if (enabledHighlight.indexOf("highlight-target-person") > -1) changeNodeOpacity(node, "target-person");
                if (enabledHighlight.indexOf("highlight-target-stereotype") > -1) changeNodeOpacity(node, "target-stereotype");
            }

            /**
             * Highlight a node if the checkbox is checked and if the node presents the feature
             * */
            function highlightByFeature(node, enabledHighlight, changeNodeOpacity) {
                if (enabledHighlight.indexOf("highlight-features-argumentation") > -1) changeNodeOpacity(node, "argumentation");
                if (enabledHighlight.indexOf("highlight-features-constructiveness") > -1) changeNodeOpacity(node, "constructiveness");

                if (enabledHighlight.indexOf("highlight-features-sarcasm") > -1) changeNodeOpacity(node, "sarcasm");
                if (enabledHighlight.indexOf("highlight-features-mockery") > -1) changeNodeOpacity(node, "mockery");
                if (enabledHighlight.indexOf("highlight-features-intolerance") > -1) changeNodeOpacity(node, "intolerance");

                if (enabledHighlight.indexOf("highlight-features-improper-language") > -1) changeNodeOpacity(node, "improper_language");
                if (enabledHighlight.indexOf("highlight-features-insult") > -1) changeNodeOpacity(node, "insult");
                if (enabledHighlight.indexOf("highlight-features-aggressiveness") > -1) changeNodeOpacity(node, "aggressiveness");
            }
        }

        console.log('[User]', user.split('/')[2], '| [interaction]', 'TreeMap_layout_loaded', '| [Date]', Date.now());
    });
});