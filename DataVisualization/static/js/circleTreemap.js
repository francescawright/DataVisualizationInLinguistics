// Variable to check if the ready function code has been completely executed
var codeReady = false;

var static_values_checked = true;

let div = document.createElement("div");
div.setAttribute("id", "div-circle-container");
div.style.textAlign = "center";
div.style.marginRight = "520px";
document.querySelector(container).appendChild(div);

let svg = d3v4.select("#div-circle-container")
        .append("svg")
        .attr("width", 960)
        .attr("height", 960)
        .attr("style", "overflow: visible; margin-top: 100px; margin-left: 130px;")


let diameter = svg.attr("width"),
g = svg.append("g").attr("transform", "translate(2,2)"),
format = d3v4.format(",d");

let pack = d3v4.pack()
    .size([diameter - 2, diameter - 2])
    .padding(3);

var node;

var root;

var targetImagesPath = ["icons/Group.svg", "icons/Person.svg", "icons/Stereotype.svg", "icons/Blank.png"];
var toxicityLevelsPath = ["Level0.png", "Level1.png", "Level2.png", "Level3.png"];

/* Colours
 * */
const colourToxicity0 = "#f7f7f7", colourToxicity1 = "#cccccc", colourToxicity2 = "#737373",
    colourToxicity3 = "#000000", colourNewsArticle = "#C8EAFC";

var colourBothStances = "#FFA500", colourPositiveStance = "#77dd77", colourNegativeStance = "#ff6961",
    colourNeutralStance = "#2b2727";

var colorFeature = ["#90F6B2", "#1B8055",
    "#97CFFF", "#1795FF", "#0B5696",
    "#E3B7E8", "#A313B3", "#5E1566"
];

const minOpacityValue = 0.2, maxOpacityValue = 1;

// shadow filter //
const defs = svg.append("defs");

let filter = defs.append("filter")
    .attr("id", "dropshadow")

filter.append("feDropShadow")
    .attr("flood-opacity", 1)
    .attr("dx", 0)
    .attr("dy", 1)


// Select which properties and if an intersection or union of those
// let checkboxHighlightMenu = document.querySelector("input[name=cbHighlightMenu]");

let checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
let checkboxAND = document.querySelector("input[type=radio][name=cbHighlightProperty][value=and-group]");
let checkboxOR = document.querySelector("input[type=radio][name=cbHighlightProperty][value=or-group]");
var checkboxesHighlightGroupOR = document.querySelectorAll("input[type=checkbox][name=cbHighlightOR]");
var checkboxesHighlightGroupAND = document.querySelectorAll("input[type=checkbox][name=cbHighlightAND]");

console.log('[User]', user.split('/')[2], '| [interaction]', 'TreeMap_layout_loaded', '| [Date]', Date.now());
var enabledHighlight = []; //Variable which contains the string of the enabled options to highlight

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

treeJSON = d3v4.json(dataset, function (error, root) {
    if (error) throw error;

    // Used to obtain the nodes belonging to the deepest thread
    var deepestNodesPath;

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

    var tooltipText;

     // Hover rectangle in which the information of a node is displayed
    var tooltip = d3v4.select(container)
        .append("div")
        .attr("class", "my-tooltip") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "60")
        .style("visibility", "hidden");

    root = d3v4.hierarchy(root)
        .sum(function (d) {
            switch (d.comment_level) {
                //case 0:
                //return colourToxicity0;
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
        .data(pack(root).descendants())
        .enter().append("g")
        .attr("class", function (d) {
            return d.children ? "node" : "leaf node";
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })

    var nodes = flatten(root); //get nodes as a list


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
                if (d !== root) {
                    tooltipText = writeTooltipTextCircle(d);
                    tooltip.style("visibility", "visible").html(tooltipText);
                } else {
                    tooltipText = writeTooltipRootCircle(d, totalNumberOfNodes, totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic);
                    tooltip.style("visibility", "visible").html(tooltipText);
                }
            })
        .on("mousemove", function (d) {
                // if (d !== root) {
                    return tooltip.style("top", (d3v4.mouse(document.querySelector(container))[1] - 145) + "px").style("left", (d3v4.mouse(document.querySelector(container))[0] - 510) + "px");
                // }
            })
        .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            });
        //    .on("mouseover", function(d){  console.log(d)
        //        return tooltip.text(d.data.name).style("visibility", "visible").html("tooltip");})
        //    .on("mousemove", function(){return tooltip.style("top", d3v4.event.pageY -30 +"px").style("left",d3v4.event.pageX + 480 +"px");})
	    //    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    /**
     * Recursive function to compute the global statistics
     * counts nodes by toxicity and by targets
     * */
    function getStatisticValuesCircle(node) {
        if (!node.children) {
            return {
                children: 0,
                toxicityLevel: node.data.toxicity_level,
                toxicity0: 0,
                toxicity1: 0,
                toxicity2: 0,
                toxicity3: 0,
                totalTargGroup: 0,
                totalTargPerson: 0,
                totalTargStereotype: 0,
                totalTargNone: 0,
                targGroup: node.data.target_group,
                targPerson: node.data.target_person,
                targStereotype: node.data.stereotype,
                targNone: 0
            };
        }
        var total = 0, childrenList = [],
            totalToxic0 = 0, totalToxic1 = 0, totalToxic2 = 0, totalToxic3 = 0,
            totalTargGroup = 0, totalTargPerson = 0, totalTargStereotype = 0, totalTargNone = 0;

        if (node.children) {
            node.children.forEach(function (d) {
                childrenList = getStatisticValuesCircle(d);
                total += childrenList.children + 1;

                totalToxic0 += childrenList.toxicity0;
                totalToxic1 += childrenList.toxicity1;
                totalToxic2 += childrenList.toxicity2;
                totalToxic3 += childrenList.toxicity3;
                if (d.data.highlighted) {
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
                childrenList.targGroup && d.data.highlighted ? totalTargGroup += childrenList.totalTargGroup + 1 : totalTargGroup += childrenList.totalTargGroup;
                childrenList.targPerson && d.data.highlighted ? totalTargPerson += childrenList.totalTargPerson + 1 : totalTargPerson += childrenList.totalTargPerson;
                childrenList.targStereotype && d.data.highlighted ? totalTargStereotype += childrenList.totalTargStereotype + 1 : totalTargStereotype += childrenList.totalTargStereotype;
                (!childrenList.targGroup && !childrenList.targPerson && !childrenList.targStereotype) && d.data.highlighted ? totalTargNone += childrenList.totalTargNone + 1 : totalTargNone += childrenList.totalTargNone;
            })
        }

        return {
            children: total,
            toxicityLevel: node.data.toxicity_level,
            toxicity0: totalToxic0,
            toxicity1: totalToxic1,
            toxicity2: totalToxic2,
            toxicity3: totalToxic3,
            totalTargGroup: totalTargGroup,
            totalTargPerson: totalTargPerson,
            totalTargStereotype: totalTargStereotype,
            totalTargNone: totalTargNone,
            targGroup: node.data.target_group,
            targPerson: node.data.target_person,
            targStereotype: node.data.stereotype,
            targNone: 0
        };
    }

function hovered(hover) {
    return function(d) {
        d3v4.selectAll(d.ancestors().map(function(d) {}));
  };
}

//Functions to highlight/unhighlight
function highlightNodesByPropertyOR(node, enabledHighlight) {
    //If no tag (toxicity, stance,...) checkbox is selected: highlight all
    if (enabledHighlight.length === 0) {
        nodes.forEach(function (d) {
            d.data.highlighted = 1;
        });
        node.style("opacity", maxOpacityValue);
    } else { //If some tag checkbox is selected behave as expected
        //First, unhighlight everything
        nodes.forEach(function (d) {
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
        if (result){
            d.data.highlighted = 1;
        }
        return result;
    }).style("opacity", maxOpacityValue);

}

function highlightNodesByPropertyAND(node, enabledHighlight) {
    //First, highlight everything
    nodes.forEach(function (d) {
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
        if (result){
            d.data.highlighted = 1;
        }
        return result;
    }).style("opacity", maxOpacityValue);

}

function highlightLongestThreadCircle(node) {

    nodes.forEach(function (d) {
        d.data.highlighted = 1;
    });

    node.style("opacity", maxOpacityValue);

    node.filter(function (d) {
        let result = !deepestNodesPath.includes(d);
        if (result){
            d.data.highlighted = 0;
        }
        return result;
    }).style("stroke", "black").style("color", "black").style("opacity", minOpacityValue);

    node.filter(function (d) {
        let result = d.depth === 0;
        if (result){
            d.data.highlighted = 1;
        }
        return result;
    }).style("opacity", maxOpacityValue);
}

function highlightWidestLevelsCircle(node, levelsIndexes) {

    nodes.forEach(function (d) {
        d.data.highlighted = 1;
    });

    node.style("opacity", maxOpacityValue);

    node.filter(function (d) {
        let result = !levelsIndexes.includes(d.depth);
        if (result){
            d.data.highlighted = 0;
        }
        return result;
    }).style("stroke", "black").style("color", "black").style("opacity", minOpacityValue);

    node.filter(function (d) {
        let result = d.depth === 0;
        if (result){
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
                    if (static_values_checked) {
                        statisticBackground.html(writeStatisticText());
                    }
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

            document.querySelector("#tree-container div.my-statistic").style.visibility = "visible";
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
        });
    } catch
        (TypeError) {
        console.error("Error attaching buttons... trying again...");
    }

    highlightNodesByPropertyOR(node, enabledHighlight);
    highlightNodesByPropertyAND(node, enabledHighlight);

    //I compute the values for the statistic data showing in the background
    var listStatistics = getStatisticValuesCircle(root);
    var totalNumberOfNodes = listStatistics.children;

    var totalNotToxic = listStatistics.toxicity0,
        totalMildlyToxic = listStatistics.toxicity1,
        totalToxic = listStatistics.toxicity2,
        totalVeryToxic = listStatistics.toxicity3;

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
        highlightLongestThreadCircle(node);

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

        highlightWidestLevelsCircle(node, widestLevels[0]);

        if (static_values_checked) {
            statisticBackground.html(writeStatisticText());
        }
    });

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
    function retrieveAttributeFromComment(d, propertyNameToRetrieve) {
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
            let result = retrieveAttributeFromComment(d.data, attributeName);
            if (result){
                d.data.highlighted = 1;
            }
            return result;
        }).style("stroke", "black").style("color", "black").style("opacity", maxOpacityValue);
    }

    function unhighlightNode(node, attributeName) {
        node.filter(function (d) {
            let result = !retrieveAttributeFromComment(d.data, attributeName);
            if (result){
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

    // Div where the title of the "Static Values" is displayed
    var statisticBackground = d3v4.select(container)
        .append("div")
        .attr("class", "my-statistic") //add the tooltip class
        .style("position", "absolute")
        .style("z-index", "1") //it has no change
        .style("visibility", "visible")
        .style("right", "320px");

    function writeStatisticText() {
        // var statisticText = "<span style='font-size: 22px;'> Summary of " + sel_item.split('/')[2] + "</span>";
        var statisticText = "<table style='width: 530px; margin-top: 50px; z-index: 100;'>";

        var listStatisticsUpdate = getStatisticValuesCircle(root);

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
        let hierarchy = d3v4.hierarchy(node);
        let lenght = d3v4.max(hierarchy.descendants(), d => d.depth);
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


