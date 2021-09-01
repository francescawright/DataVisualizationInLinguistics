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

/* Constant
 * */
const duration = 750; //Duration of the animation of a transition

//Graph
const edgeLength = 300; //Horizontal length of an edge between a parent node and its child node
const separationHeight = 10; //Desired separation between two node brothers
const canvasHeight = 900, canvasWidth = 2200; //Dimensions of our canvas (grayish area)

//
const radiusFactor = 3; // The factor by which we multiply the radius of a node when collapsed with more than 2 children
const opacityValue = 0.2; // Opacity when a value is not highlighted
const imgRatio = 10; //Percentage of difference between the radii of a node and its associated image

//Paths
const rootPath = pr; //Path for the image related to the root
const pathTargets = pt;
const pathFeatures = pf;

//Colours
const colourBothStances = "#FFA500", colourPositiveStance = "#77dd77", colourNegativeStance = "#ff6961",
    colourNeutralStance = "#2b2727";

const colourToxicity0 = "#f7f7f7", colourToxicity1 = "#cccccc", colourToxicity2 = "#737373",
    colourToxicity3 = "#000000", colourNewsArticle = "lightsteelblue", colourCollapsed1Son = "lightsteelblue";

const colourUnhighlightedToxicity0 = "#f0f0f0", colourUnhighlightedToxicity1 = "#d6d6d6",
    colourUnhighlightedToxicity2 = "#ababab", colourUnhighlightedToxicity3 = "#6b6b6b",
    colourUnhighlightedCollapsed1Son = "#cfdbeb";

const colorFeature = ["#a1d99b", "#31a354",
    "#fee5d9", "#fcbba1", "#fc9272",
    "#fb6a4a", "#de2d26", "#a50f15"];

//Targets: size, position
const targetIconHeight = 15, targetIconWidth = 15, targetIconGroupX = -30, targetIconPersonX = -50,
    targetIconStereotypeX = -70, targetIconY = -10; //Size and relative position of targets drawn as icons

//Features: size, position
const cheeseX = 15, cheeseY = -10, cheeseHeight = 20, cheeseWidth = 20;


const objRoot = {
    class: "rootNode",
    id: "rootNode",
    fileName: "root.png"  };

// Objects to draw the target as ring
const objTargetGroupRing = {
        class: "targetGroup",
        id: "targetGroup",
        name: "target-group",
        x: -10,
        y: -10,
        height: 20,
        width: 20,
        fileName: "Group.png"
    },
    objTargetPersonRing = {
        class: "targetPerson",
        id: "targetPerson",
        name: "target-person",
        x: -10,
        y: -10,
        height: 20,
        width: 20,
        fileName: "Person.png"
    },
    objTargetStereotypeRing = {
        class: "targetStereotype",
        id: "targetStereotype",
        name: "target-stereotype",
        x: -10,
        y: -10,
        height: 20,
        width: 20,
        fileName: "Stereotype.png"
    },
    objTargetGrayRing = {
        class: "targetGray",
        id: "targetGray",
        name: "gray-ring",
        x: -10,
        y: -10,
        height: 20,
        width: 20,
        fileName: "Gray.png"
    };

// Objects to draw the target on the left side
const objTargetGroup = {
        class: "targetGroup",
        id: "targetGroup",
        name: "target-group",
        x: -30,
        y: -10,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Group.svg"
    },
    objTargetPerson = {
        class: "targetPerson",
        id: "targetPerson",
        name: "target-person",
        x: -50,
        y: -10,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Person.svg"
    },
    objTargetStereotype = {
        class: "targetStereotype",
        id: "targetStereotype",
        name: "target-stereotype",
        x: -70,
        y: -10,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Stereotype.svg"
    };

// Objects to draw the target inside of the node in a triangle
const objTargetGroupInside = {
        class: "targetGroup",
        id: "targetGroup",
        name: "target-group",
        x: -0.9,
        y: -0.8,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Group.svg"
    },
    objTargetPersonInside = {
        class: "targetPerson",
        id: "targetPerson",
        name: "target-person",
        x: -0.5,
        y: 0,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Person.svg"
    },
    objTargetStereotypeInside = {
        class: "targetStereotype",
        id: "targetStereotype",
        name: "target-stereotype",
        x: -0.1,
        y: -0.8,
        height: targetIconHeight,
        width: targetIconWidth,
        fileName: "Stereotype.svg"
    };

// Objects for toxicities for Ecem tests
const objToxicity0 = {class: "toxicity0", id: "toxicity0", name: "toxicity-0", fileName: "Level0.svg"},
    objToxicity1 = {class: "toxicity1", id: "toxicity1", name: "toxicity-1", fileName: "Level1.svg"},
    objToxicity2 = {class: "toxicity2", id: "toxicity2", name: "toxicity-2",fileName: "Level2.svg"},
    objToxicity3 = {class: "toxicity3", id: "toxicity3", name: "toxicity-3",fileName: "Level3.svg"};

// Objects for feature images
const objFeatArgumentation = {
        class: "featArgumentation",
        id: "featArgumentation",
        name: "argumentation",
        color: "#a1d99b",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Argumentation.svg"
    },
    objFeatConstructiveness = {
        class: "featConstructiveness",
        id: "featConstructiveness",
        name: "constructiveness",
        color: "#31a354",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Constructiveness.svg"
    },
    objFeatSarcasm = {
        class: "featSarcasm",
        id: "featSarcasm",
        name: "sarcasm",
        color: "#fee5d9",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Sarcasm.svg"
    },
    objFeatMockery = {
        class: "featMockery",
        id: "featMockery",
        name: "mockery",
        color: "#fcbba1",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Mockery.svg"
    },
    objFeatIntolerance = {
        class: "featIntolerance",
        id: "featIntolerance",
        name: "intolerance",
        color: "#fc9272",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Intolerance.svg"
    },
    objFeatImproper = {
        class: "featImproper",
        id: "featImproper",
        name: "improper_language",
        color: "#fb6a4a",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Improper.svg"
    },
    objFeatInsult = {
        class: "featInsult",
        id: "featInsult",
        name: "insult",
        color: "#de2d26",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Insult.svg"
    },
    objFeatAggressiveness = {
        class: "featAggressiveness",
        id: "featAggressiveness",
        name: "aggressiveness",
        color: "#a50f15",
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Aggressiveness.svg"
    },
    objFeatGray = {
        class: "featGray",
        id: "featGray",
        name: "gray",
        selected: 1,
        x: cheeseX,
        y: cheeseY,
        height: cheeseHeight,
        width: cheeseWidth,
        fileName: "Gray.svg"
    };

/**
 * Draw an icon for the root node
 * */
function visualiseRootIcon(node, root){
    //Filter the nodes and append an icon just for the root node
    node.filter(function (d) {
        return d.parent === undefined;
    }).append("image")
        .attr('class', objRoot.class)
        .attr('id', objRoot.id)
        .attr("x", root.x - root.radius)
        .attr("y", root.y - root.radius)
        .attr("height", root.radius * 2)
        .attr("width", root.radius * 2)
        .attr("href", rootPath + objRoot.fileName)
        .attr("opacity", 1);
}

/**
 * Compute the radius of the node based on the number of children it has
 * */
function computeNodeRadius(d) {
    /*
        If node has children,
        more than 2: new radius = 16 + 3 * (#children - 2)
        2 children: new radius = 16
        1 child: new radius = 13
        0 children: new radius = 10
    * */
    d.radius = 10;
    if (d.children === undefined && d._children === undefined) return d.radius; //If no children, radius = 10

    var children =  d.children ?? d._children; //Assign children collapsed or not

    children.length > 2 ? d.radius = 16 + radiusFactor * (children.length - 2) // more than 2 children
        : children.length  === 2 ? d.radius = 16 //2 children
        : d.radius = 13; //One child
    //Avoid the root node from being so large that overlaps/hides its children
    if(d.parent === undefined && d.radius > edgeLength / 2) d.radius = edgeLength / 2.0;
    return d.radius;
}

/**
 * Computes the borders of a box containing our nodes
 * */
function computeDimensions(nodes){
    /* Note our coordinate system:
    *
    *                     | X negative
    *                     |
    * Y negative <--------|-------> Y positive
    *                     |
    *                     | X positive
    * And note we need to take into account the radius of the node
    * */
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for(const n of nodes){
        if((n.x - n.radius) < minX) minX = n.x - n.radius;
        if((n.y - n.radius) < minY) minY = n.y - n.radius;
        if((n.x + n.radius) > maxX) maxX = n.x + n.radius;
        if((n.y + n.radius) > maxY) maxY = n.y + n.radius;
    }
    return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
}

/**
 * Center graph and zoom to fit the whole graph visualization in our canvas
 * */
function zoomToFitGraph(minX, minY, maxX, maxY, root) {
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

    scale = Math.min(canvasWidth/boxWidth, canvasHeight/boxHeight);

    var newX = canvasWidth/2.0,
        newY = canvasHeight/2.0;

    if(canvasWidth/boxWidth < canvasHeight/boxHeight) {
        newY -= midX * scale;
        newX -= midY * scale;
    }
    else newX -= midY * scale;

    //For nodes wider than tall, we need to displace them to the middle of the graph
    if(newY < boxHeight*scale && boxHeight*scale < canvasHeight) newY =  canvasHeight / 2.0;

    d3.select('g').transition()
        .duration(duration)
        .attr("transform", "translate(" + (newX + root.radius*scale) + "," + newY + ")scale(" + scale + ")");

    return {initialZoom: scale,
        initialY: newX,
        initialX: newY}
}

function colourUnhighlightedNode(d) {
    if (d._children?.length === 1) return colourUnhighlightedCollapsed1Son;
    switch (d.toxicity_level) {
        case 0: return colourUnhighlightedToxicity0;
        case 1: return colourUnhighlightedToxicity1;
        case 2: return colourUnhighlightedToxicity2;
        case 3: return colourUnhighlightedToxicity3;
    }
}

/**
 * Highlights nodes by category of Toxicity
 * */
function highlightToxicityOR(node, enabledHighlight){
    //Toxicity 0
    if (enabledHighlight.indexOf("highlight-toxicity-0") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 0) d.highlighted = 1;
            console.log(d);
            return (d.toxicity_level === 0);
        }).style("opacity", 1);
    }

    //Toxicity 1
    if (enabledHighlight.indexOf("highlight-toxicity-1") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 1) d.highlighted = 1;
            console.log(d);
            return (d.toxicity_level === 1);
        }).style("opacity", 1);
    }

    //Toxicity 2
    if (enabledHighlight.indexOf("highlight-toxicity-2") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 2) d.highlighted = 1;
            console.log(d);
            return (d.toxicity_level === 2);
        }).style("opacity", 1);
    }

    //Toxicity 3
    if (enabledHighlight.indexOf("highlight-toxicity-3") > -1) {
        node.filter(function (d) {
            if (d.toxicity_level === 3) d.highlighted = 1;
            console.log(d);
            return (d.toxicity_level === 3);
        }).style("opacity", 1);
    }

}

/**
 * Highlights nodes and edges by category of Toxicity belonging to the intersection of selected values
 *
 * Unhighlights nodes that do not have the selected property
 * */
function highlightToxicityAND(node, enabledHighlight, opacityValue = 0.2) {
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
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

}


function highlightStanceOR(node, enabledHighlight){
    //Neutral stance CB is checked
    if (enabledHighlight.indexOf("highlight-neutral") > -1) {
        node.filter(function (d) {
            if (!d.positive_stance && !d.negative_stance) d.highlighted = 1;
            return (!d.positive_stance && !d.negative_stance);
        }).style("opacity", 1);
    }

    //Positive stance CB is checked
    if (enabledHighlight.indexOf("highlight-positive") > -1) {
        node.filter(function (d) {
            if (d.positive_stance) d.highlighted = 1;
            return (d.positive_stance);
        }).style("opacity", 1);

    }

    //Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-negative") > -1) {
        node.filter(function (d) {
            if (d.negative_stance) d.highlighted = 1;
            return (d.negative_stance);
        }).style("opacity", 1);
    }

}

function highlightStanceAND(node, enabledHighlight, opacityValue = 0.2){
    //Neutral stance CB is checked
    if (enabledHighlight.indexOf("highlight-neutral") > -1) {
        node.filter(function (d) {
            if (d.positive_stance || d.negative_stance) d.highlighted = 0;
            return (d.positive_stance || d.negative_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Positive stance CB is checked
    if (enabledHighlight.indexOf("highlight-positive") > -1) {
        node.filter(function (d) {
            if (!d.positive_stance) d.highlighted = 0;
            return (!d.positive_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

    //Negative stance CB is checked
    if (enabledHighlight.indexOf("highlight-negative") > -1) {
        node.filter(function (d) {
            if (!d.negative_stance) d.highlighted = 0;
            return (!d.negative_stance);
        })//.select("circle.nodeCircle")
            .style("position", "relative")
            .style("z-index", 1)
            .style("opacity", opacityValue);
    }

}

function highlightTargetOR(node, enabledHighlight){
    //Target group CB is checked
    if (enabledHighlight.indexOf("highlight-group") > -1) {
        node.filter(function (d) {
            if (d.target_group) d.highlighted = 1;
            return (d.target_group);
        }).style("opacity", 1);
    }

    //Target person CB is checked
    if (enabledHighlight.indexOf("highlight-person") > -1) {
        node.filter(function (d) {
            if (d.target_person) d.highlighted = 1;
            return (d.target_person);
        }).style("opacity", 1);
    }

    //Stereotype CB is checked
    if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
        node.filter(function (d) {
            if (d.stereotype) d.highlighted = 1;
            return (d.stereotype);
        }).style("opacity", 1);
    }
}

function highlightTargetAND(node, enabledHighlight, opacityValue = 0.2){
    //Target group CB is checked
    if (enabledHighlight.indexOf("highlight-group") > -1) {
        node.filter(function (d) {
            if (!d.target_group) d.highlighted = 0;
            return (!d.target_group);
        }).style("opacity", opacityValue);

    }

    //Target person CB is checked
    if (enabledHighlight.indexOf("highlight-person") > -1) {
        node.filter(function (d) {
            if (!d.target_person) d.highlighted = 0;
            return (!d.target_person);
        }).style("opacity", opacityValue);
    }

    //Stereotype CB is checked
    if (enabledHighlight.indexOf("highlight-stereotype") > -1) {
        node.filter(function (d) {
            if (!d.stereotype) d.highlighted = 0;
            return (!d.stereotype);
        }).style("opacity", opacityValue);
    }
}

function highlightPositiveOR(node, enabledHighlight){
    //Argumentation CB is checked
    if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
        node.filter(function (d) {
            if (d.argumentation) d.highlighted = 1;
            return (d.argumentation);
        }).style("opacity", 1);

    }

    //Constructiveness CB is checked
    if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
        node.filter(function (d) {
            if (d.constructiveness) d.highlighted = 1;
            return (d.constructiveness);
        }).style("opacity", 1);
    }

}

function highlightPositiveAND(node, enabledHighlight, opacityValue = 0.2){
    //Argumentation CB is checked
    if (enabledHighlight.indexOf("highlight-argumentation") > -1) {
        node.filter(function (d) {
            if (!d.argumentation); d.highlighted = 0;
            return (!d.argumentation);
        }).style("opacity", opacityValue);
    }

    //Constructiveness CB is checked
    if (enabledHighlight.indexOf("highlight-constructiveness") > -1) {
        node.filter(function (d) {
            if (!d.constructiveness); d.highlighted = 0;
            return (!d.constructiveness);
        }).style("opacity", opacityValue);
    }

}

function highlightNegativeOR(node, enabledHighlight){
    //Sarcasm CB is checked
    if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
        node.filter(function (d) {
            if (d.sarcasm) d.highlighted = 1;
            return (d.sarcasm);
        }).style("opacity", 1);
    }

    //Mockery CB is checked
    if (enabledHighlight.indexOf("highlight-mockery") > -1) {
        node.filter(function (d) {
            if (d.mockery) d.highlighted = 1;
            return (d.mockery);
        }).style("opacity", 1);
    }

    //Intolerance CB is checked
    if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
        node.filter(function (d) {
            if (d.intolerance) d.highlighted = 1;
            return (d.intolerance);
        }).style("opacity", 1);
    }

    //Improper language CB is checked
    if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
        node.filter(function (d) {
            if (d.improper_language) d.highlighted = 1;
            return (d.improper_language);
        }).style("opacity", 1);
    }

    //Insult language CB is checked
    if (enabledHighlight.indexOf("highlight-insult") > -1) {
        node.filter(function (d) {
            if (d.insult) d.highlighted = 1;
            return (d.insult);
        }).style("opacity", 1);
    }

    //Aggressiveness language CB is checked
    if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
        node.filter(function (d) {
            if (d.aggressiveness) d.highlighted = 1;
            return (d.aggressiveness);
        }).style("opacity", 1);
    }
}

function highlightNegativeAND(node, enabledHighlight, opacityValue = 0.2){
    //Sarcasm CB is checked
    if (enabledHighlight.indexOf("highlight-sarcasm") > -1) {
        node.filter(function (d) {
            if (!d.sarcasm) d.highlighted = 0;
            return (!d.sarcasm);
        }).style("opacity", opacityValue);
    }

    //Mockery CB is checked
    if (enabledHighlight.indexOf("highlight-mockery") > -1) {
        node.filter(function (d) {
            if (!d.mockery) d.highlighted = 0;
            return (!d.mockery);
        }).style("opacity", opacityValue);
    }

    //Intolerance CB is checked
    if (enabledHighlight.indexOf("highlight-intolerance") > -1) {
        node.filter(function (d) {
            if (!d.intolerance) d.highlighted = 0;
            return (!d.intolerance);
        }).style("opacity", opacityValue);
    }

    //Improper language CB is checked
    if (enabledHighlight.indexOf("highlight-improper-language") > -1) {
        node.filter(function (d) {
            if (!d.improper_language) d.highlighted = 0;
            return (!d.improper_language);
        }).style("opacity", opacityValue);
    }

    //Insult language CB is checked
    if (enabledHighlight.indexOf("highlight-insult") > -1) {
        node.filter(function (d) {
            if (!d.insult) d.highlighted = 0;
            return (!d.insult);
        }).style("opacity", opacityValue);
    }

    //Aggressiveness language CB is checked
    if (enabledHighlight.indexOf("highlight-aggressiveness") > -1) {
        node.filter(function (d) {
            if (!d.aggressiveness) d.highlighted = 0;
            return (!d.aggressiveness);
        }).style("opacity", opacityValue);
    }
}

function highlightNodesByPropertyOR(node, link, nodes, enabledHighlight){
    if (enabledHighlight.length === 0){ //If no tag (toxicity, stance,...) checkbox is selected: highlight all
        nodes.forEach(function (d) {
            d.highlighted = 1;
        });
        node.style("opacity", 1);
    }
    else { //If some tag checkbox is selected behave as expected
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
    //Highlight only the edges whose both endpoints are highlighted
    link.style("opacity", function (d) {
        return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
    });
}

function highlightNodesByPropertyAND(node, link, nodes, enabledHighlight) {
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

    //Highlight only the edges whose both endpoints are highlighted
    link.style("opacity", function (d) {
        return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
    });
}

function writeIdLabel(nodeEnter) {
    nodeEnter.append("text")
        .attr("x", 25)
        .attr("dy", ".35em")
        .attr('class', 'nodeText')
        .attr('id', 'nodeText')
        .attr("text-anchor", "end")
        .text(function (d) {
            return d.name;
        })
        .style("opacity", 1);
}

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
function sizeImage(nodeRadius, radiusPercentage = imgRatio){
    return 2 * nodeRadius * (1 - radiusPercentage / 100.0);
}

//Hide features, targets and toxicities

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
 * Revove all toxicities of all nodes
 * */
function removeAllToxicities() {
    d3.selectAll("#toxicity0").remove();
    d3.selectAll("#toxicity1").remove();
    d3.selectAll("#toxicity2").remove();
    d3.selectAll("#toxicity3").remove();
}

function hideFeatureImages(){
    removeAllFeatures();
    removeAllToxicities();
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
 * Remove all the target icon or images of the given node
 * */
function removeThisTargets(nodeEnter) {
    nodeEnter.select("#targetGroup").remove();
    nodeEnter.select("#targetPerson").remove();
    nodeEnter.select("#targetStereotype").remove();
    nodeEnter.select("#targetGray").remove();
}

function removeToxicities(nodeEnter) {
    nodeEnter.selectAll("#toxicity0").remove();
    nodeEnter.selectAll("#toxicity1").remove();
    nodeEnter.selectAll("#toxicity2").remove();
    nodeEnter.selectAll("#toxicity3").remove();
}

//Draw features, targets and toxicities


/**
 * Return the value of a property (set from the JSON) of the given node
 *
 * @param d Datum of a node
 * @param {string} propertyNameToRetrieve The property whose value is returned
 * */
function retrieveAttributeFromComment(d, propertyNameToRetrieve){
    switch (propertyNameToRetrieve) {
        //Features
        case "argumentation": return d.argumentation;
        case "constructiveness": return d.constructiveness;
        case "sarcasm": return d.sarcasm;
        case "mockery": return d.mockery;
        case "intolerance": return d.intolerance;
        case "improper_language": return d.improper_language;
        case "insult": return d.insult;
        case "aggressiveness": return d.aggressiveness;
        case "gray": return 1;
        case "gray-ring": return 0.5;

        //Targets
        case "target-group": return  d.target_group;
        case "target-person": return d.target_person;
        case "target-stereotype": return d.stereotype;

        //Toxicity
        case "toxicity-0": return d.toxicity_level === 0 ? 1 : 0;
        case "toxicity-1": return d.toxicity_level === 1 ? 1 : 0;
        case "toxicity-2": return d.toxicity_level === 2 ? 1 : 0;
        case "toxicity-3": return d.toxicity_level === 3 ? 1 : 0;

        default:
            console.log("An attribute could not be retrieved because the key word did not match any case...");
            break;
    }
}

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
        .attr("r", "10.5")
        .attr("transform", function (d) {
            return "translate(" + (d.radius + (itemOrder + 1) * (10.5*2)) + "," + 0 + ")";
        })
        .attr("fill", object.color)
        .style("stroke", "black")
        .style("stroke-width", "0.5px")
        .attr("opacity", function (d) {
            if (d.parent === undefined) return 0;
            return retrieveAttributeFromComment(d, object.name);
        });
}

/**
 * Draw features as dots
 * */
function drawFeatureDots(nodeEnter, enabledFeatures){
    removeThisFeatures(nodeEnter);
    removeToxicities(nodeEnter); //Remove all the pngs for toxicity

    let index = 0;
    if(enabledFeatures.indexOf("argumentation") > -1) drawObjectAsDot(nodeEnter, objFeatArgumentation, index);
    if(enabledFeatures.indexOf("constructiveness") > -1) drawObjectAsDot(nodeEnter, objFeatConstructiveness, ++index);

    if(enabledFeatures.indexOf("sarcasm") > -1) drawObjectAsDot(nodeEnter, objFeatSarcasm, ++index);
    if(enabledFeatures.indexOf("mockery") > -1) drawObjectAsDot(nodeEnter, objFeatMockery, ++index);
    if(enabledFeatures.indexOf("intolerance") > -1) drawObjectAsDot(nodeEnter, objFeatIntolerance, ++index);

    if(enabledFeatures.indexOf("improper_language") > -1)  drawObjectAsDot(nodeEnter, objFeatImproper, ++index);
    if(enabledFeatures.indexOf("insult") > -1)  drawObjectAsDot(nodeEnter, objFeatInsult, ++index);
    if(enabledFeatures.indexOf("aggressiveness") > -1)  drawObjectAsDot(nodeEnter, objFeatAggressiveness, ++index);
}

/**
 * Draw an image centered on the node a imgRatio smaller conditionally
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {object} object The object of a property
 * @param {string} path The path of the image
 * @param {number} percentage The percentage of the difference of radii between the node and the image
 * */
function drawImageOnNode(nodeEnter, object, path, percentage = imgRatio){
    nodeEnter.append("image")
        .attr('class', object.class)
        .attr('id', object.id)
        .attr("x", function (d) {
            return positionImage(d.radius, percentage);
        })
        .attr("y", function (d) {
            return positionImage(d.radius, percentage);
        })
        .attr("height", function (d) {
            return sizeImage(d.radius, percentage);
        })
        .attr("width", function (d) {
            return sizeImage(d.radius, percentage);
        })
        .attr("href", path + object.fileName)
        .attr("opacity", function (d) {
            if (d.parent === undefined) return 0;
            return retrieveAttributeFromComment(d, object.name);
        });
}

/**
 * Call to draw all the features
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {string} path The path of the image
 * @param {array} enabledFeatures The array containing which checkboxes are selected
 * @param {number} percentage The percentage of the difference of radii between the node and the image
 * */
function drawFeatures(nodeEnter, path, enabledFeatures, percentage = imgRatio) {
    if(enabledFeatures.indexOf("argumentation") > -1) drawImageOnNode(nodeEnter, objFeatArgumentation, path, percentage);
    if(enabledFeatures.indexOf("constructiveness") > -1) drawImageOnNode(nodeEnter, objFeatConstructiveness, path, percentage);

    if(enabledFeatures.indexOf("sarcasm") > -1) drawImageOnNode(nodeEnter, objFeatSarcasm, path, percentage);
    if(enabledFeatures.indexOf("mockery") > -1) drawImageOnNode(nodeEnter, objFeatMockery, path, percentage);
    if(enabledFeatures.indexOf("intolerance") > -1) drawImageOnNode(nodeEnter, objFeatIntolerance, path, percentage);

    if(enabledFeatures.indexOf("improper_language") > -1) drawImageOnNode(nodeEnter, objFeatImproper, path, percentage);
    if(enabledFeatures.indexOf("insult") > -1) drawImageOnNode(nodeEnter, objFeatInsult, path, percentage);
    if(enabledFeatures.indexOf("aggressiveness") > -1) drawImageOnNode(nodeEnter, objFeatAggressiveness, path, percentage);
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
function drawTargetsGeneral(nodeEnter, path, enabledTargets, target, draw, percentage = imgRatio) {
    if(enabledTargets.indexOf("target-group") > -1) draw(nodeEnter, target.group, path, percentage);
    if(enabledTargets.indexOf("target-person") > -1) draw(nodeEnter, target.person, path, percentage);
    if(enabledTargets.indexOf("target-stereotype") > -1) draw(nodeEnter, target.stereotype, path, percentage);
}

/**
 * Call to draw all the toxicities
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {string} path The path of the image
 * @param {number} percentage The percentage of the difference of radii between the node and the image
 * */
function drawToxicities(nodeEnter, path, percentage = imgRatio) {
    drawImageOnNode(nodeEnter, objToxicity0, path, percentage);
    drawImageOnNode(nodeEnter, objToxicity1, path, percentage);
    drawImageOnNode(nodeEnter, objToxicity2, path, percentage);
    drawImageOnNode(nodeEnter, objToxicity3, path, percentage);
}

/**
 * Draw features as portions inspired in the Trivial Pursuit game
 * */
function drawFeaturesAsCheeseInside(nodeEnter, localPath, enabledFeatures){
    removeThisFeatures(nodeEnter);
    removeToxicities(nodeEnter); //Remove all the pngs for toxicity

    drawImageOnNode(nodeEnter, objFeatGray,pathFeatures + localPath);
    drawFeatures(nodeEnter, pathFeatures + localPath, enabledFeatures);
}

/**
 * Draw features in a circular glyph
 * */
function drawFeaturesAsCircularGlyph(nodeEnter, localPath, enabledFeatures, enabledTargets){
    removeThisFeatures(nodeEnter);
    removeThisTargets(nodeEnter);
    removeToxicities(nodeEnter);

    let path = pathFeatures + localPath;
    let percentage = 0;

    drawImageOnNode(nodeEnter, objFeatGray, path, percentage);
    drawFeatures(nodeEnter, path, enabledFeatures, 0);

    drawToxicities(nodeEnter, path, 0);

    let target = {group: objTargetGroup, person: objTargetPerson, stereotype: objTargetStereotype};
    drawTargetsGeneral(nodeEnter, path, enabledTargets, target, drawImageOnNode,0);
}

//Draw targets

/**
 * Draws the 3 targets of a node if the checkbox is checked
 * and if the node has that target (sets the opacity to visible)
 * */
function drawTargetsAsRings(nodeEnter, localPath, enabledTargets){
    removeThisTargets(nodeEnter);

    let path = pathTargets + localPath;

    drawImageOnNode(nodeEnter, objTargetGrayRing, path);

    let target = {group: objTargetGroupRing, person: objTargetPersonRing, stereotype: objTargetStereotypeRing};
    drawTargetsGeneral(nodeEnter, path, enabledTargets, target, drawImageOnNode);
}

/**
 * Draw an image on the left side of a node displaced by object.x pixels
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {object} object The object of a property
 * @param {string} path The path of the image
 * */
function drawObjectTargetOutside(nodeEnter, object, path){
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
            return retrieveAttributeFromComment(d, object.name);
        });
}

/**
 * Draws the 3 targets of a node on the left side horizontally if the checkbox is checked
 * and if the node has that target (sets the opacity to visible)
 * */
function drawTargetsAsIconOutside(nodeEnter, localPath, enabledTargets){
    removeThisTargets(nodeEnter);

    let path = pathTargets + localPath;
    let target = {group: objTargetGroup, person: objTargetPerson, stereotype: objTargetStereotype};
    drawTargetsGeneral(nodeEnter, path, enabledTargets, target, drawObjectTargetOutside);
}

/**
 * Draw an image inside a node scaled and positioned in a triangle
 *
 * @param {d3-node} nodeEnter Node to which we append the image
 * @param {object} object The object of a property
 * @param {string} path The path of the image
 * */
function drawObjectTargetInside(nodeEnter, object, path){
    nodeEnter.append("image")
        .attr('class', object.class)
        .attr('id', object.id)
        .attr("x", function (d) {
            return d.radius * object.x;
        })
        .attr("y", function (d) {
            return d.radius * object.y;
        })
        .attr("height", function (d) {
            return sizeImage(d.radius)/2.0;
        })
        .attr("width", function (d) {
            return sizeImage(d.radius)/2.0;
        })
        .attr("href", path + object.fileName)
        .attr("opacity", function (d) {
            if (d.parent === undefined) return 0;
            return retrieveAttributeFromComment(d, object.name);
        });
}

/**
 * Draws the 3 targets of a node if the checkbox is checked
 * and if the node has that target (sets the opacity to visible)
 *
 * Draw in a triangle Group --- Stereotype
 *                          \ /
 *                         Person
 * */
function drawTargetsAsIconInside(nodeEnter, localPath, enabledTargets){
    removeThisTargets(nodeEnter);

    let path = pathTargets + localPath;
    let target = {group: objTargetGroupInside, person: objTargetPersonInside, stereotype: objTargetStereotypeInside};
    drawTargetsGeneral(nodeEnter, path, enabledTargets, target, drawObjectTargetInside);
}


/********* Unused functions right now in this layout *****************/

/**
 * Draws the 3 targets of a node if the checkbox is checked
 * and if the node has that target (sets the opacity to visible)
 *
 * The icon used is from the local path passed by parameter
 * The css values are from the target objects that are icons
 * */
function drawTargets(nodeEnter, localPath, enabledTargets) {
    removeThisTargets(nodeEnter);
    var cbShowTargets = [enabledTargets.indexOf("target-group"), enabledTargets.indexOf("target-person"), enabledTargets.indexOf("target-stereotype")];
    var listOpacity;
    var targets = [objTargetGroup, objTargetPerson, objTargetStereotype];

    for (let i = 0; i < targets.length; i++) {
        if (cbShowTargets[i] > -1) {
            nodeEnter.append("image")
                .attr('class', targets[i].class)
                .attr('id', targets[i].id)
                .attr("x", targets[i].x)
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

//Deprecated
function drawFeatureAsCheeseOutside(nodeEnter, localPath, enabledFeatures) {
    removeThisFeatures(nodeEnter);
    removeToxicities(nodeEnter); //Remove all the pngs for toxicity

    //Add the gray cheese
    nodeEnter.append("image")
        .attr('class', objFeatGray.class)
        .attr('id', objFeatGray.id)
        .attr("x", objFeatGray.x) //NOTE: it is always displayed at the left side!!
        .attr("y", objFeatGray.y)
        .attr("height", objFeatGray.height)
        .attr("width", objFeatGray.width)
        .attr("href", pathFeatures + localPath + objFeatGray.fileName)
        .attr("opacity", function (d) {
            if (d.parent === undefined) return 0;
            return 0.5;
        });

    var cbFeatureEnabled = [enabledFeatures.indexOf("argumentation"), enabledFeatures.indexOf("constructiveness"),
        enabledFeatures.indexOf("sarcasm"), enabledFeatures.indexOf("mockery"), enabledFeatures.indexOf("intolerance"),
        enabledFeatures.indexOf("improper_language"), enabledFeatures.indexOf("insult"), enabledFeatures.indexOf("aggressiveness")];

    var features = [objFeatArgumentation, objFeatConstructiveness, objFeatSarcasm, objFeatMockery, objFeatIntolerance, objFeatImproper, objFeatInsult, objFeatAggressiveness];
    var listOpacity;

    for (let i = 0; i < features.length; i++) {
        if (cbFeatureEnabled[i] > -1) {
            nodeEnter.append("image")
                .attr('class', features[i].class)
                .attr('id', features[i].id)
                .attr("x", features[i].x)
                .attr("y", features[i].y)
                .attr("height", features[i].height)
                .attr("width", features[i].width)
                .attr("href", pathFeatures + localPath + features[i].fileName)
                .attr("opacity", function (d) {
                    if (d.parent === undefined) return 0;
                    listOpacity = [d.argumentation, d.constructiveness, d.sarcasm, d.mockery, d.intolerance, d.improper_language, d.insult, d.aggressiveness];
                    return listOpacity[i];
                });
        }
    }
}

//Deprecated
/**
 * Hide all previous features and targets
 * Draw everything inside of the node
 * */
function drawFeatureAsGlyph(nodeEnter, localPath, localPosition, enabledFeatures, enabledTargets) {
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


    for (let i = 0; i < allObjectsInNode.length; i++) {
        if (cbShowTargets[i] > -1) { //If the checkbox is checked, display it if it has the property
            nodeEnter.append("image")
                .attr('class', allObjectsInNode[i].class)
                .attr('id', allObjectsInNode[i].id)
                .attr("x", localPosition)
                .attr("y", -10)
                .attr("height", 20)
                .attr("width", 20)
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

/**************************/


/**
 * Determines the type of visualization for the targets
 * determinated by the drop down menu
 *
 *
 * */
function selectTargetVisualization(nodeEnter, dropdownTargets, drawingAllInOne, enabledTargets,
                                   dropdownFeatures, cbFeatureInside, enabledFeatures) {
    var option = dropdownTargets.value;

    //If we are displaying all in one, call that function
    if (drawingAllInOne) selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
        cbFeatureInside, enabledFeatures, enabledTargets);
    else {
        switch (option) {
            //draw as icons on the left side of the node
            case "icons":
                drawTargets(nodeEnter, "icons/", enabledTargets);
                break;

            case "icon-outside-node":
                drawTargetsAsIconOutside(nodeEnter, "icons/", enabledTargets);
                break;

            case "icon-on-node":
                drawTargetsAsIconInside(nodeEnter, "icons/", enabledTargets);
                break;
            case "directory-1":
                drawTargets(nodeEnter, "newOption1/", enabledTargets)
                break;
            case "directory-2":
                drawTargets(nodeEnter, "newOption2/", enabledTargets)
                break;
            //draw as ring outside of the node
            case "ring-on-node":
                drawTargetsAsRings(nodeEnter, "rings/", enabledTargets)
                break;
            //draw as an icon if 1, as rings if more options checked
            case "one-icon-or-rings":
                enabledTargets.length > 1 ? drawTargetsAsRings(nodeEnter, "rings/", enabledTargets) : drawTargets(nodeEnter, "icons/", enabledTargets);
                break;

            default:
                console.log("default option", option);
                break;
        }
    }
}


/**
 * Determines the type of visualization for the features
 * determinated by the drop down menu
 * */
function selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
                                    cbFeatureInside, enabledFeatures, enabledTargets) {
    var option = dropdownFeatures.value;
    document.getElementById("feature-over-node-or-outside").style.display = "none"; //Hide the dropdown menu
    drawingAllInOne = false;
    let localPosition;
    cbFeatureInside.checked ? localPosition = -10 : localPosition = 30;
    switch (option) {
        case "dots":
            selectTargetVisualization(nodeEnter, dropdownTargets, drawingAllInOne, enabledTargets, dropdownFeatures, cbFeatureInside, enabledFeatures); //draw the targets if necessary
            drawFeatureDots(nodeEnter, enabledFeatures); //Always drawn on the right side
            break;
        case "trivial-cheese-on-node":
            selectTargetVisualization(nodeEnter, dropdownTargets, drawingAllInOne, enabledTargets, dropdownFeatures, cbFeatureInside, enabledFeatures); //draw the targets if necessary
            drawFeaturesAsCheeseInside(nodeEnter, "trivialCheese/", enabledFeatures); //Always drawn on the right side
            break;
        case "trivial-cheese-outside-node":
            selectTargetVisualization(nodeEnter, dropdownTargets, drawingAllInOne, enabledTargets, dropdownFeatures, cbFeatureInside, enabledFeatures); //draw the targets if necessary
            drawFeatureAsCheeseOutside(nodeEnter, "trivialCheese/", enabledFeatures); //Always drawn on the right side
            break;

        case "directory-1": //"All for one and one for all" we will draw the features inside of the circle, the targets outside will be hidden and the level of toxicity in blue
            drawingAllInOne = true;
            //Deletes the targets and draws them again but INSIDE of the node
            document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu

            drawFeatureAsGlyph(nodeEnter, "Bubble/", localPosition, enabledFeatures, enabledTargets);
            break;
        case "directory-2":
            drawingAllInOne = true;
            //Deletes the targets and draws them again but INSIDE of the node
            document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
            drawFeaturesAsCircularGlyph(nodeEnter, "Circular/", enabledFeatures, enabledTargets);
            break;

        case "directory-3":
            drawingAllInOne = true;
            //Deletes the targets and draws them again but INSIDE of the node
            document.getElementById("feature-over-node-or-outside").style.display = "block"; //Show the dropdown menu
            drawFeatureAsGlyph(nodeEnter, "Rectangular/", localPosition, enabledFeatures, enabledTargets);
            break;

        default:
            console.log("default option", option);
            break;
    }
}

//Statistic functions

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
    let total = 0, childrenList = [], totalToxic0 = 0, totalToxic1 = 0, totalToxic2 = 0, totalToxic3 = 0;

    let children = node.children ?? node._children;

    if (children) {
        children.forEach(function (d) {

            childrenList = getDescendants(d);
            total += childrenList.children + 1;

            totalToxic0 += childrenList.toxicity0;
            totalToxic1 += childrenList.toxicity1;
            totalToxic2 += childrenList.toxicity2;
            totalToxic3 += childrenList.toxicity3;

            switch (childrenList.toxicityLevel) {
                case 0: totalToxic0 += 1; break;
                case 1: totalToxic1 += 1; break;
                case 2: totalToxic2 += 1; break;
                case 3: totalToxic3 += 1; break;
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
    let total = 0, childrenList = [],
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

            switch (childrenList.toxicityLevel) {
                case 0: totalToxic0 += 1; break;
                case 1: totalToxic1 += 1; break;
                case 2: totalToxic2 += 1; break;
                case 3: totalToxic3 += 1; break;
            }

            //Targets are not exclusive
            childrenList.targGroup ? totalTargGroup += childrenList.totalTargGroup + 1 : totalTargGroup += childrenList.totalTargGroup;
            childrenList.targPerson ? totalTargPerson += childrenList.totalTargPerson + 1 : totalTargPerson += childrenList.totalTargPerson;
            childrenList.targStereotype ? totalTargStereotype += childrenList.totalTargStereotype + 1 : totalTargStereotype += childrenList.totalTargStereotype;
            (!childrenList.targGroup && !childrenList.targPerson && !childrenList.targStereotype) ? totalTargNone += childrenList.totalTargNone + 1 : totalTargNone += childrenList.totalTargNone;
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

function writeStatisticText(totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic,
                            totalGroup, totalPerson, totalStereotype, totalNone) {
    let statisticText = "<table style='width: 500px;'>";

    let statTitlesToxicity = ["Not toxic", "Mildly toxic", "Toxic", "Very toxic"];
    let statTitlesTargets = ["Target group", "Target person", "Stereotype", "None"];
    let statValuesTox = [totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic];
    let statValuesTarg = [totalGroup, totalPerson, totalStereotype, totalNone];
    let targetImagesPath = ["icons/Group.png", "icons/Person.png", "icons/Stereotype.png", "/icons/Blank.png"];
    let toxicityLevelsPath = ["Level0.png", "Level1.png", "Level2.png", "Level3.png"];

    for (let i = 0; i < statTitlesToxicity.length; i++) {
        statisticText += "<tr style='font-size: 20px;'>"; //Start table line

        //Write toxicity and target line
        statisticText += "<td style='font-size: 20px; width: 400px; margin-right: 25px;'>" + "<img src=" + pf + toxicityLevelsPath[i] + " style='width: 35px; margin-right: 15px; margin-left: 25px;'>" + statTitlesToxicity[i].toString() + ": " + "<td style='padding-right: 55px;'>" + statValuesTox[i].toString() + "</td>";
        statisticText += "<td style='font-size: 20px; width: 400px;'>" + "<img src=" + pt + targetImagesPath[i] + " style='width: 25px; margin-right: 15px; margin-left: 25px;'>" + statTitlesTargets[i].toString() + ": " + "<td>" + statValuesTarg[i].toString() + "</td>";

        statisticText += "</tr>"; //End table line
    }

    statisticText += "</table>";
    return statisticText;
}

function writeTooltipText(d, tooltipText) {

    //I want to show Argument and Constructiveness in one line, I add a dummy space to keep that in the loop
    var jsonValues = [d.name, d.toxicity_level, d.depth,
        d.argumentation, d.constructiveness, -1,
        d.sarcasm, d.mockery, d.intolerance,
        d.improper_language, d.insult, d.aggressiveness,
        d.target_group, d.target_person, d.stereotype];
    var jsonNames = ["Comment ID", "Toxicity level", "Comment level",
        "Argument", "Constructiveness", " ",
        "Sarcasm", "Mockery", "Intolerance",
        "Improper language", "Insult", "Aggressiveness",
        "Target group", "Target person", "Stereotype"];
    let i = 0;
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
    return tooltipText;
}

// Get JSON data
treeJSON = d3.json(dataset, function (error, treeData) {

    let totalNodes = 0; //Total number of nodes
    let i = 0; //Alternative node ID

    let root, nodes;
    var initialZoom, initialX, initialY; //Initial zoom and central coordinates of the first visualization of the graph

    let drawingAllInOne = false; //if we are drawing all together or separated


    let tooltipText; // The variable displaying the information of a node inside a floating rectangle

    root = treeData; //Define the root

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
    var tooltip = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-tooltip") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

    // Div where the title of the "Static Values" is displayed
    var statisticBackground = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-statistic") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "0") //it has no change
        .style("visibility", "visible");

    // Div where the sum up information of "Static Values" is displayed
    var statisticTitleBackground = d3.select("#tree-container")
        .append("div")
        .attr("class", "my-statistic-title") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "0") //it has no change
        .style("visibility", "visible");


    /*SECTION checkboxes*/
    var checkboxId = document.querySelector("input[name=cbId]");

    //Check the values of the checkboxes and do something
    var checkboxesTargets = [document.getElementById("target-group"), document.getElementById("target-person"), document.getElementById("target-stereotype")];//document.querySelectorAll("input[type=checkbox][name=cbTargets]");
    // for (var i = 0; i < checkboxesTargets.length; i++) {
    //     checkboxesTargets[i] = "target-" + checkboxesTargets[i];
    // }

    let enabledTargets = []; //Variable which contains the string of the enabled options to display targets

    // Select all checkboxes with the name 'cbFeatures' using querySelectorAll.
    var checkboxes = document.querySelectorAll("input[type=checkbox][name=cbFeatures]");
    let enabledFeatures = []; //Variable which contains the string of the enabled options to display features
    var checkboxFeatureMenu = document.querySelector("input[name=cbFeatureMenu]");

    // Select how to display the features: svg circles or trivial cheese
    var checkboxesPropertyFeature = document.querySelectorAll("input[type=checkbox][name=cbFeatureProperty]");

    //Dropdown menu
    var checkboxesPositioningFeature = document.querySelectorAll("input[type=checkbox][name=cbFeaturePositioning]");
    var cbFeatureInside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=on-node]");
    var cbFeatureOutside = document.querySelector("input[type=checkbox][name=cbFeaturePositioning][value=node-outside]");

    // Select which properties and if an intersection or union of those
    var checkboxHighlightMenu = document.querySelector("input[name=cbHighlightMenu]");
    var checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
    var checkboxAND = document.querySelector("input[type=checkbox][name=cbHighlightProperty][value=and-group]");
    var checkboxOR = document.querySelector("input[type=checkbox][name=cbHighlightProperty][value=or-group]");
    var checkboxesHighlightGroup = document.querySelectorAll("input[type=checkbox][name=cbHighlight]");

    let enabledHighlight = []; //Variable which contains the string of the enabled options to highlight
    /*END SECTION checkboxes*/

    var checkButtons = document.querySelectorAll("input[name=check_button_features]");

    var dropdownTargets = document.getElementById("dropdown-targets");
    var dropdownFeatures = document.getElementById("dropdown-features");


    // A recursive helper function for performing some setup by walking through all nodes
    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (let i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish edgeLength
    visit(treeData, function (d) {
        totalNodes++;
    }, function (d) {
        return d.children?.length > 0 ? d.children : null;
    });


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

        /*
        * NOTE: Add to the initial position values (initialX and initialY) the movement registered by d3.
        * d3.event.translate returns an array [x,y] with starting values [50, 200]
        * The values X and Y are swapped in zoomToFit() and we need to take that into account to give the new coordinates
        * */
        let movement = d3.event.translate;
        let newX = initialX + (movement[1]-200);
        let newY = initialY + (movement[0]-50);
        svgGroup.attr("transform", "translate(" + [newY, newX] + ")scale(" + newScale + ")");
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);


    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .attr("class", "overlay")
        .call(zoomListener);


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

        d = toggleChildren(d); //Collapse node
        update(d); //NOTE: we are passing each sun that was collapsed
    }

    function checkUncheckAll() {
        checkboxes.forEach(cb => cb.checked = !cb.checked);
    }


    function update(source) {

        tree = tree.nodeSize([separationHeight, 0]) //heigth and width of the rectangles that define the node space
            .separation(function (a, b) {
                //Compute the radius of the node for the first visualization of the graph
                if (a.radius === undefined) a.radius = computeNodeRadius(a);
                if(b.radius === undefined) b.radius = computeNodeRadius(b);

                return Math.ceil( (a.radius + b.radius) / separationHeight ) + 0.5;
            });

        // Compute the new tree layout.
        nodes = tree.nodes(root).reverse();
        //nodes = tree.nodes(root);
        var links = tree.links(nodes);

        // Set widths between levels based on edgeLength.
        nodes.forEach(function (d) {
            d.y = (d.depth * edgeLength);
        });

        // Update the nodes…
        var node = svgGroup.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', function (d) {
                click(d, nodeEnter);
            })
            .on('mouseover', function (d) {
                if (d !== root) {
                    tooltip.style("visibility", "visible")
                        .html(writeTooltipText(d, tooltipText));
                }
            })
            .on("mousemove", function (d) {
                if (d !== root) {
                    return tooltip.style("top", (d3.event.pageY - 30) + "px").style("left", (d3.event.pageX - 480) + "px");
                }
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            });

        nodeEnter.append("image")
            .attr('class', 'backgroundCircle')
            .attr('id', "backgroundCircle")
            .style("position", "relative")
            .style("z-index", -1)
            .style("opacity", 1);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", "10.5")
            .style("stroke", "black")
            .style("stroke-width", 0.5);

        nodeEnter.append("text")
            .attr("x", 25)
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr('id', 'nodeText')
            .attr("text-anchor", "end")
            .text(function (d) {
                return d.name;
            })
            .style("opacity", function (d) {
                return checkboxId.checked ? 1 : 0;
            });

        //Dropdown menus
        dropdownTargets.addEventListener("change", function () {
            selectTargetVisualization(nodeEnter, dropdownTargets, drawingAllInOne, enabledTargets, dropdownFeatures, cbFeatureInside, enabledFeatures);
        });
        dropdownFeatures.addEventListener("change", function () {
            selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
                cbFeatureInside, enabledFeatures, enabledTargets);
        });

        /*SECTION checkboxes listener*/
        checkboxId.addEventListener('change', function () {
            this.checked ? writeIdLabel(nodeEnter) : d3.selectAll("#nodeText").remove();
        });

        // Use Array.forEach to add an event listener to each checkbox.
        // Draw target images
        checkboxesTargets.forEach(function (checkboxItem) {
            checkboxItem.addEventListener('change', function () {
                enabledTargets =
                    Array.from(checkboxesTargets) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectTargetVisualization(nodeEnter, dropdownTargets, drawingAllInOne, enabledTargets, dropdownFeatures, cbFeatureInside, enabledFeatures);
            })
        });

        // if the option to show features is checked, enable checkboxes and dropdown menu
        checkboxFeatureMenu.addEventListener('change', function () {
            if (this.checked) { //Enable checkboxes and dropdown menu + show features if they are selected
                checkboxesPropertyFeature.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                checkboxesPositioningFeature.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                checkboxes.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                dropdownFeatures.removeAttribute('disabled');

                checkButtons.forEach(function (button) {
                        button.removeAttribute('disabled');
                    }
                );

                if (!document.querySelector("input[value=dot-feat]").checked && !document.querySelector("input[value=cheese-feat]").checked) {
                    document.querySelector("input[value=dot-feat]").checked = true;
                    //drawFeatures(nodeEnter);
                } else {
                    //checkboxFeatureCheese.checked ? drawFeaturesCheese(nodeEnter) : drawFeatures(nodeEnter);
                    console.log(enabledFeatures);
                }

                if (!document.querySelector("input[value=on-node]").checked && !document.querySelector("input[value=node-outside]").checked) {
                    document.querySelector("input[value=on-node]").checked = true;
                }
                selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
                    cbFeatureInside, enabledFeatures, enabledTargets);

            } else { //Disable checkboxes and dropdown menu + remove all the features
                checkboxesPropertyFeature.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                checkboxesPositioningFeature.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                document.getElementById("feature-over-node-or-outside").style.display = "none";
                dropdownFeatures.setAttribute('disabled', 'disabled');

                checkboxes.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                checkButtons.forEach(function (button) {
                        button.setAttribute('disabled', 'disabled');
                    }
                );

                hideFeatureImages(); //Hide all images associated with the features
            }
        });

        // if DOT is checked, uncheck OR
        cbFeatureInside.addEventListener('change', function () {
            this.checked ? cbFeatureOutside.checked = false : cbFeatureOutside.checked = true;
            selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
                cbFeatureInside, enabledFeatures, enabledTargets);
        });
        // if CHEESE is checked, uncheck AND
        cbFeatureOutside.addEventListener('change', function () {
            this.checked ? cbFeatureInside.checked = false : cbFeatureInside.checked = true;
            selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
                cbFeatureInside, enabledFeatures, enabledTargets);
        });

        // Use Array.forEach to add an event listener to each checkbox.
        // Draw feature circles
        checkboxes.forEach(function (checkboxItem) {
            checkboxItem.addEventListener('change', function () {
                enabledFeatures =
                    Array.from(checkboxes) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.

                selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
                    cbFeatureInside, enabledFeatures, enabledTargets);
            })
        });

        //Listener related to highlighting nodes and edges
        checkboxHighlightMenu.addEventListener('change', function () {
            if (this.checked) {
                checkboxesProperty.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });
                checkboxesHighlightGroup.forEach(function (checkboxItem) {
                    checkboxItem.removeAttribute('disabled');
                });

                if (!document.querySelector("input[value=and-group]").checked && !document.querySelector("input[value=or-group]").checked) {
                    document.querySelector("input[value=and-group]").checked = true;
                    highlightNodesByPropertyAND(node, link, nodes, enabledHighlight);
                } else {
                    checkboxAND.checked ? highlightNodesByPropertyAND(node, link, nodes, enabledHighlight) : highlightNodesByPropertyOR(node, link, nodes, enabledHighlight);
                    console.log(enabledHighlight);
                }

            } else {
                console.log("We disable all checkboxes ...");
                checkboxesProperty.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });
                checkboxesHighlightGroup.forEach(function (checkboxItem) {
                    checkboxItem.setAttribute('disabled', 'disabled');
                });

                //We make all nodes and links visible again
                node.style("opacity", 1);
                link.style("opacity", 1);
            }
        });

        // If AND is selected, uncheck the OR and highlight by property AND
        checkboxAND.addEventListener('change', function () {
            if (this.checked) {
                checkboxOR.checked = false;
                highlightNodesByPropertyAND(node, link, nodes, enabledHighlight);
            } else {
                checkboxOR.checked = true;
                highlightNodesByPropertyOR(node, link, nodes, enabledHighlight);
            }
        });
        // If OR is selected, uncheck the AND and highlight by property OR
        checkboxOR.addEventListener('change', function () {
            if (this.checked) {
                checkboxAND.checked = false;
                highlightNodesByPropertyOR(node, link, nodes, enabledHighlight);
            } else {
                checkboxAND.checked = true;
                highlightNodesByPropertyAND(node, link, nodes, enabledHighlight);
            }
        });

        // Use Array.forEach to add an event listener to each checkbox.
        checkboxesHighlightGroup.forEach(function (checkboxItem) {
            checkboxItem.addEventListener('change', function () {
                enabledHighlight =
                    Array.from(checkboxesHighlightGroup) // Convert checkboxes to an array to use filter and map.
                        .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes.
                        .map(i => i.value) // Use Array.map to extract only the checkbox values from the array of objects.
                console.log(enabledHighlight);
                checkboxOR.checked ? highlightNodesByPropertyOR(node, link, nodes, enabledHighlight) : highlightNodesByPropertyAND(node, link, nodes, enabledHighlight);
            })
        });

        /*END SECTION checkboxes listener*/

        /* NOTE: the nodes that get to the function update()
        are root and the ones that were collapsed
        Therefore, for this nodes that are getting uncollapsed we want to:
        - show the targets if necessary
        - show the text if necessary (not here, we do it with nodeEnter)
        - show the features if necessary
        - highlight nodes and edges
        * */
        selectTargetVisualization(nodeEnter, dropdownTargets, drawingAllInOne, enabledTargets, dropdownFeatures, cbFeatureInside, enabledFeatures);
        checkboxFeatureMenu.checked ? selectFeatureVisualization(nodeEnter, dropdownFeatures, dropdownTargets, drawingAllInOne,
            cbFeatureInside, enabledFeatures, enabledTargets) : hideFeatureImages();

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", 25)
            .attr("text-anchor", "end")
            .text(function (d) {
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            //.attr("r", 4.5)
            .attr("r", function (d) {
                return computeNodeRadius(d);
            })
            .style("fill", function (d) {
                if (d._children?.length === 1) return colourCollapsed1Son; //If it is collapsed and just has one children
                switch (d.toxicity_level) { //Otherwise, colour the node according to its level of toxicity
                    case 0: return colourToxicity0;
                    case 1: return colourToxicity1;
                    case 2: return colourToxicity2;
                    case 3: return colourToxicity3;
                    default: return colourNewsArticle;
                }
            });

        node.select("image.backgroundCircle")
            .attr("x", function (d) {
                return - d.radius;
            })
            .attr("y", function (d) {
                return - d.radius;
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

        visualiseRootIcon(node, root); //Draw an icon for the root node


        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .style("stroke", function (d) {
                if (d.target.positive_stance && d.target.negative_stance) return colourBothStances; //Both against and in favour
                else if (d.target.positive_stance === 1) return colourPositiveStance; //In favour
                else if (d.target.negative_stance === 1)  return colourNegativeStance; //Against
                else return colourNeutralStance; //Neutral comment
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        if (checkboxHighlightMenu.checked && source.children)
            checkboxOR.checked ? highlightNodesByPropertyOR(node, link, nodes, enabledHighlight) : highlightNodesByPropertyAND(node, link, nodes, enabledHighlight);



        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
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
    var svgGroup = baseSvg.append("g");

    // Define the root position
    root.x0 = 0;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root);

    let box = computeDimensions(nodes);
    let initialSight = zoomToFitGraph(box.minX, box.minY, box.maxX, box.maxY, root);
    initialZoom = initialSight.initialZoom;
    initialX = initialSight.initialX;
    initialY = initialSight.initialY;


    //I compute the values for the statistic data showing in the background
    const {children, toxicityLevel,
        toxicity0, toxicity1, toxicity2, toxicity3,
        totalTargGroup,totalTargPerson, totalTargStereotype, totalTargNone,
        ...rest} = getStatisticValues(root);

    // (({ a, c }) => ({ a, c }))(object);

    let statisticTitle = "<span style='font-size: 22px;'> Static values of " + sel_item.split('/')[2] + "</span>";
    statisticTitleBackground.style("visibility", "visible").html(statisticTitle);
    statisticBackground.style("visibility", "visible").html(writeStatisticText(toxicity0, toxicity1, toxicity2, toxicity3,
        totalTargGroup, totalTargPerson, totalTargStereotype, totalTargNone));

});
