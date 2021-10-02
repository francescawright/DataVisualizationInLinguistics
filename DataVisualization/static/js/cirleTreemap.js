
let svg = d3.select("#svg_treeMap"),
    diameter = svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(2,2)"),
    format = d3.format(",d");

let pack = d3.pack()
    .size([diameter - 2, diameter - 2])
    .padding(3);

let node;

const colourToxicity0 = "#FAFFA8", colourToxicity1 = "#F8BB7C", colourToxicity2 = "#F87A54",
    colourToxicity3 = "#7A1616", colourNewsArticle = "#E3E1C5";

const minOpacityValue = 0.2, maxOpacityValue = 1;

// shadow filter //
const defs = svg.append("defs");

let filter = defs.append("filter")
    .attr("id", "dropshadow")

filter.append("feDropShadow")
    .attr("flood-opacity", 1)
    .attr("dx", 0)
    .attr("dy", 1)

treeJSON = d3.json(dataset, function (error, root) {
//d3.json("https://ecemkavaz.github.io/jsonData/fakeDataCircle2.json", function(error, root) {
    if (error) throw error;

    root = d3.hierarchy(root)
        .sum(function (d) {
            //console.log(d);
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

    node = g.selectAll(".node")
        .data(pack(root).descendants())
        .enter().append("g")
        .attr("class", function (d) {
            return d.children ? "node" : "leaf node";
        })
        .attr("transform", function (d) {
            //console.log(d.data.name, d.x, d.y);
            return "translate(" + d.x + "," + d.y + ")";
        })


    //node.append("title")
    //  .text(function(d) { return d.data.name + "\n" + format(d.value); });
    //
    node.append("circle")
        .attr("r", function (d) {
            if (d.children) {
                return d.r + 2;
            } else {
                return d.r;
            }
        })
        // .attr("r", function (d) {
        //     var rootSize = 1000;
        //     console.log(d);
        //     console.log(d.children);
        //     // return d.value;
        //     // if (d.depth === 0) {
        //     //     return rootSize;
        //     // }
        //     //
        //     // if (!d.children) {
        //     //     return 4;
        //     // }
        //     // console.log(d.depth, d.parent.children.length);
        //     // switch (d.depth) {
        //     //     // case 1:
        //     //     //     return rootSize / d.parent.children.length * 2;
        //     //     // case 2:
        //     //     //     return (rootSize / d.parent.children.length) / d.parent.parent.children.length * 2;
        //     //     // case 3:
        //     //     //     return ((rootSize / d.parent.children.length) / d.parent.parent.children.length) / d.parent.parent.parent.children.length * 2;
        //     //     // case 4:
        //     //     //     return (((rootSize / d.parent.children.length) / d.parent.parent.children.length) / d.parent.parent.parent.children.length) / d.parent.parent.parent.parent.children.length * 2;
        //     //     case 6:
        //     //         return 1;
        //     //     default:
        //     //         return 8;
        //     // }
        //
        // })
        .attr("filter", "url(#dropshadow)")
        .style("fill", function (d) {
            switch (d.data.toxicity_level) {
                case 0: return colourToxicity0;
                case 1: return colourToxicity1;
                case 2: return colourToxicity2;
                case 3: return colourToxicity3;
                default: return colourNewsArticle;
            }
        })

    // name of the node
    node.filter(function (d) {
        return !d.children;
    }).append("text")
        .attr("dy", "0.3em")
        .text(function (d) {
            return d.data.name;
    });

});


// Select which properties and if an intersection or union of those
let checkboxHighlightMenu = document.querySelector("input[name=cbHighlightMenu]");
let checkboxesProperty = document.querySelectorAll("input[type=checkbox][name=cbHighlightProperty]");
let checkboxAND = document.querySelector("input[type=checkbox][name=cbHighlightProperty][value=and-group]");
let checkboxOR = document.querySelector("input[type=checkbox][name=cbHighlightProperty][value=or-group]");
let checkboxesHighlightGroup = document.querySelectorAll("input[type=checkbox][name=cbHighlight]");

let enabledHighlight = []; //Variable which contains the string of the enabled options to highlight

//Listeners

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
            highlightNodesByPropertyAND(node);
        } else {
            checkboxAND.checked ? highlightNodesByPropertyAND(node) : highlightNodesByPropertyOR(node, enabledHighlight);
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
        //link.style("opacity", 1);
    }
});

// If AND is selected, uncheck the OR and highlight by property AND
checkboxAND.addEventListener('change', function () {
    if (this.checked) {
        checkboxOR.checked = false;
        highlightNodesByPropertyAND(node);
    } else {
        checkboxOR.checked = true;
        highlightNodesByPropertyOR(node, enabledHighlight);
    }
});
// If OR is selected, uncheck the AND and highlight by property OR
checkboxOR.addEventListener('change', function () {
    if (this.checked) {
        checkboxAND.checked = false;
        highlightNodesByPropertyOR(node, enabledHighlight);
    } else {
        checkboxAND.checked = true;
        highlightNodesByPropertyAND(node);
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
        checkboxOR.checked ? highlightNodesByPropertyOR(node, enabledHighlight) : highlightNodesByPropertyAND(node);
    })
});




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

        //Stances
        case "positive": return d.positive_stance;
        case "negative": return d.negative_stance;
        case "neutral": return !(d.positive_stance || d.negative_stance);
        case "both": return d.positive_stance && d.negative_stance;

        default:
            console.log("An attribute could not be retrieved because the key word did not match any case...");
            break;
    }
}

function highlightNode(node, attributeName) {
    node.filter(function (d) {
        return retrieveAttributeFromComment(d.data, attributeName);
    }).style("opacity", maxOpacityValue);
}

function unhighlightNode(node, attributeName) {
    node.filter(function (d) {
        return !retrieveAttributeFromComment(d.data, attributeName);
    }).style("opacity", minOpacityValue);
}

/**
 * Highlight a node if the checkbox is checked and if the node presents a certain level of toxicity
 * */
function highlightByToxicity(node, enabledHighlight, changeNodeOpacity){
    if(enabledHighlight.indexOf("highlight-toxicity-0") > -1) changeNodeOpacity(node, "toxicity-0");
    if(enabledHighlight.indexOf("highlight-toxicity-1") > -1) changeNodeOpacity(node, "toxicity-1");
    if(enabledHighlight.indexOf("highlight-toxicity-2") > -1) changeNodeOpacity(node, "toxicity-2");
    if(enabledHighlight.indexOf("highlight-toxicity-3") > -1) changeNodeOpacity(node, "toxicity-3");
}

function highlightByStance(node, enabledHighlight, changeNodeOpacity){
    if(enabledHighlight.indexOf("highlight-neutral") > -1) changeNodeOpacity(node, "neutral");
    if(enabledHighlight.indexOf("highlight-positive") > -1) changeNodeOpacity(node, "positive");
    if(enabledHighlight.indexOf("highlight-negative") > -1) changeNodeOpacity(node, "negative");
    if(enabledHighlight.indexOf("highlight-both") > -1) changeNodeOpacity(node, "both");
}

function highlightByTarget(node, enabledHighlight, changeNodeOpacity) {
    if(enabledHighlight.indexOf("highlight-group") > -1) changeNodeOpacity(node, "target-group");
    if(enabledHighlight.indexOf("highlight-person") > -1) changeNodeOpacity(node, "target-person");
    if(enabledHighlight.indexOf("highlight-stereotype") > -1) changeNodeOpacity(node, "target-stereotype");
}

/**
 * Highlight a node if the checkbox is checked and if the node presents the feature
 * */
function highlightByFeature(node, enabledHighlight, changeNodeOpacity){
    if(enabledHighlight.indexOf("highlight-argumentation") > -1) changeNodeOpacity(node, "argumentation");
    if(enabledHighlight.indexOf("highlight-constructiveness") > -1) changeNodeOpacity(node, "constructiveness");

    if(enabledHighlight.indexOf("highlight-sarcasm") > -1) changeNodeOpacity(node, "sarcasm");
    if(enabledHighlight.indexOf("highlight-mockery") > -1) changeNodeOpacity(node, "mockery");
    if(enabledHighlight.indexOf("highlight-intolerance") > -1) changeNodeOpacity(node, "intolerance");

    if(enabledHighlight.indexOf("highlight-improper_language") > -1)  changeNodeOpacity(node, "improper_language");
    if(enabledHighlight.indexOf("highlight-insult") > -1) changeNodeOpacity(node, "insult");
    if(enabledHighlight.indexOf("highlight-aggressiveness") > -1) changeNodeOpacity(node, "aggressiveness");
}


//Functions to highlight/unhighlight
function highlightNodesByPropertyOR(node, enabledHighlight) {
    //If no tag (toxicity, stance,...) checkbox is selected: highlight all
    if (enabledHighlight.length === 0){
        node.style("opacity", maxOpacityValue);
    }
    else { //If some tag checkbox is selected behave as expected
        //First, unhighlight everything
        node.style("opacity", minOpacityValue);

        //Then highlight if the node has the property
        highlightByToxicity(node, enabledHighlight, highlightNode);
        highlightByFeature(node, enabledHighlight, highlightNode);
        highlightByStance(node, enabledHighlight, highlightNode);
        highlightByTarget(node, enabledHighlight, highlightNode);
    }
}

function highlightNodesByPropertyAND(node) {
    //First, highlight everything
    node.style("opacity", 1);

    //Then unhighlight if the node does not have the property
    highlightByToxicity(node, enabledHighlight, unhighlightNode);
    highlightByFeature(node, enabledHighlight, unhighlightNode);
    highlightByStance(node, enabledHighlight, unhighlightNode);
    highlightByTarget(node, enabledHighlight, unhighlightNode);
}
