var N = 25;
var L = 4;
var GFcomp = 0.25;
var GFelon = 2;
var d_lvl = 6;
var tol = 0.15;

var datasetPopup;
var hierarchyName;

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

function highlightDevtoolsAND(nodes, root, node, link, enabledTargetsValue, opacityValue = 0.1) {

    nodes.forEach(function (d) {
        d.highlighted = 1;
    });
    node.style("opacity", 1);

    //Significant CB is checked
    if (enabledTargetsValue.indexOf("significant-nodes") > -1) {
        node.filter(function (d) {
            if (!checkSignificant(root, d, tol)) d.highlighted = 0;
            return (!checkSignificant(root, d, tol));
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

function checkSignificant(root, node, tol) {
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

const hierarchyList = [
    "Unspecified",
    "Elongated",
    "Compact",
    "nCompact",
    "Hybrid",
];

function getHierarchyName(node, level, limitGF, d_level){
    return hierarchyList[getHierarchy(node, level, limitGF, d_level)];
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
        // is Compact
        while (queue.length > 0 && !found) { //Search all subtree until an ET node is found
            let n = queue.shift();
            //let s = getLevelRange(n);
            let s = Math.min(L, getTreeHeight(n));
            if ((n.depth + s) > level) { s = level - n.depth; } //Limit search range
            if (elongatedTendency(n, s) && getGrowFactor(n, s) != 1) {
                //if (!isSpine(n, s)) { found = true; } //ignore spines
                if (isSignificant(n, tol)) {
                    // found significant ET
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
            /*if (findTendency(node, level, limitGF, d_level, 2)) { return 3; } //nComp
            else { return 2; } //Compact*/
            CTnode = findTendency(node, level, limitGF, d_level, 2);
            if (CTnode != undefined) {
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
function getTreeData(root, node, filename) {
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

function writeTooltipText(d) {
    var featuresValues = [
        d.constructiveness,
        d.argumentation,
        d.sarcasm,
        d.mockery,
        d.intolerance,
        d.improper_language,
        d.insult,
        d.aggressiveness,
    ];
    var featuresNames = [
        "Constructiveness",
        "Argument",
        "Sarcasm",
        "Mockery",
        "Intolerance",
        "Improper",
        "Insult",
        "Aggressiveness",
    ];

    let tooltipText = "<div style='margin: 0 10px;'>";

    tooltipText += "<div><b>Comment ID:</b> " + d.name + "<br>"
                + "<b>Comment Level:</b> " + d.comment_level + "<br>"
                + "<b>Comment Depth:</b> " + d.depth + "<br>"
                + "<b>Toxicity level:</b> " + d.toxicity_level + "</div><br>";

    let i;
    tooltipText += "<ul class='tooltip-features'>";

    for (i = 0; i < featuresValues.length ; i++) {
        if (featuresValues[i]) {
            tooltipText += '<li><span style="color:' + colorFeature[i] + '; font-weight:bold; font-size: larger;">' + featuresNames[i] + '</span></li>'
        } else {
            tooltipText += '<li><span style="color:#cccccc; font-weight:bold; font-size: larger;">' + featuresNames[i] + '</span></li>'
        }

    }

    tooltipText += "</ul>";

    tooltipText += "<br><span style='font-size: medium; margin-right: 20px;'><b>Stance:</b></span>";
    tooltipText += '<svg height=" 20" width="80" style="display: inline-block; margin-bottom: 5px;';
    if (d.positive_stance) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"> <rect width="60" height="20" fill=' + colourPositiveStance + '></rect> </svg>';
    tooltipText += '<svg height=" 20" width="60" style="display: inline-block; margin-bottom: 5px;';
    if (d.negative_stance) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"> <rect width="60" height="20" fill=' + colourNegativeStance + '></rect> </svg>';

    tooltipText += "<br><br><span style='font-size: medium; margin-right: 20px;'><b>Target:</b></span>";
    tooltipText += '<img src=' + pt + targetImagesPath[1] + ' style="width: 55px; margin-right: 20px;';
    if (d.target_person) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"><img src=' + pt + targetImagesPath[0] + ' style="width: 55px; margin-right: 20px;';
    if (d.target_group) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"><img src=' + pt + targetImagesPath[2] + ' style="width: 55px; margin-right: 20px;';
    if (d.stereotype) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"><br>';

    //If node is collapsed, we also want to add some information about its sons
    if (d._children) {
        tooltipText += "<br> <table>";

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
                "<td><b>" + sonTitles[i] + ":</b> " + sonValues[i] + "</td>";
            if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
        }
        tooltipText += "</table>";
    }
    tooltipText += "<br>" + d.coment;

    //Write growingFactor of node
    //Calculate tendencies and hierarchy of nodes
    var s = L;
    tooltipText += "<br><br><b>Growing Factor:</b> " + getGrowFactor(d,s)
                + "<br><b>ET:</b> " + elongatedTendency(d, s)
                + "&nbsp;&nbsp;&nbsp;&nbsp;<b>CT:</b> " + compactTendency(d, s, GFcomp) + "</div>";

    return tooltipText;
}

function writeTooltipRoot(d, totalNumberOfNodes, totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic) {

    var sonTitles = [
        "Direct comments",
        "Total number of generated comments",
        "Not toxic",
        "Mildly toxic",
        "Toxic",
        "Very toxic",
    ];
    var sonValues = [
        d.children ? d.children.length : 0,
        totalNumberOfNodes,
        totalNotToxic,
        totalMildlyToxic,
        totalToxic,
        totalVeryToxic,
    ];
    let tooltipText = "<br> <table>";

    for (i = 0; i < sonValues.length; i++) {
        if (i % 2 === 0) tooltipText += "<tr>"; //Start table line
        tooltipText +=
            "<td><b>" + sonTitles[i] + ":</b> " + sonValues[i] + "</td>";
        if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
    }

    //Write growingFactor of root
    tooltipText += "</table>";
    var s = L;
    //Calculate hierarchy
    var t = d_lvl;
    //Calculate tendencies and hierarchy of nodes
    tooltipText += "<br><br><b>Growing Factor:</b> " + getGrowFactor(d,s)
                + "<br><b>ET:</b> " + elongatedTendency(d, s)
                + "&nbsp;&nbsp;&nbsp;&nbsp;<b>CT:</b> " + compactTendency(d, s, GFcomp)
                + "<br><b>Hierarchy:</b> " + getHierarchyName(d, s, GFcomp, t) + "<br>";

    // Add news information
    tooltipText += "<br> <table style=\" table-layout: fixed; width: 100%; word-wrap: break-word;\"><tr><td> <b>Title:</b> " + d.title + "</td></tr></table>" +
        "<br> <table style=\" table-layout: fixed; width: 100%; word-wrap: break-word;\"><tr><td> <b>Text URL:</b> <a href=" + d.text_URL + ">" + d.text_URL + "</a></td>" +
        "</tr>" +
        "<tr>" +
            "<td> <b>Comments URL:</b> <a href=" + d.comments_URL + ">" + d.comments_URL + "</a></td>" +
        "</tr></table>"
    tooltipText += "<br>";

    return tooltipText;
}

function writeTooltipTextCircle(d) {
    var featuresValues = [
        d.data.constructiveness,
        d.data.argumentation,
        d.data.sarcasm,
        d.data.mockery,
        d.data.intolerance,
        d.data.improper_language,
        d.data.insult,
        d.data.aggressiveness,
    ];
    var featuresNames = [
        "Constructiveness",
        "Argument",
        "Sarcasm",
        "Mockery",
        "Intolerance",
        "Improper",
        "Insult",
        "Aggressiveness",
    ];

    let tooltipText = "<div style='margin: 0 10px;'>";

    tooltipText += "<div><b>Comment ID:</b> " + d.data.name + "<br>"
                + "<b>Comment Level:</b> " + d.data.comment_level + "<br>"
                + "<b>Comment Depth:</b> " + d.depth + "<br>"
                + "<b>Toxicity level:</b> " + d.data.toxicity_level + "</div><br>";

    let i;
    tooltipText += "<ul class='tooltip-features'>";

    for (i = 0; i < featuresValues.length ; i++) {
        if (featuresValues[i]) {
            tooltipText += '<li><span style="color:' + colorFeature[i] + '; font-weight:bold; font-size: larger;">' + featuresNames[i] + '</span></li>'
        } else {
            tooltipText += '<li><span style="color:#cccccc; font-weight:bold; font-size: larger;">' + featuresNames[i] + '</span></li>'
        }

    }

    tooltipText += "</ul>";

    tooltipText += "<br><span style='font-size: medium; margin-right: 20px;'><b>Stance:</b></span>";
    tooltipText += '<svg height=" 20" width="80" style="display: inline-block; margin-bottom: 5px;';
    if (d.data.positive_stance) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"> <rect width="60" height="20" fill=' + colourPositiveStance + '></rect> </svg>';
    tooltipText += '<svg height=" 20" width="60" style="display: inline-block; margin-bottom: 5px;';
    if (d.data.negative_stance) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"> <rect width="60" height="20" fill=' + colourNegativeStance + '></rect> </svg>';

    tooltipText += "<br><br><span style='font-size: medium; margin-right: 20px;'><b>Target:</b></span>";
    tooltipText += '<img src=' + pt + targetImagesPath[1] + ' style="width: 55px; margin-right: 20px;';
    if (d.data.target_person) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"><img src=' + pt + targetImagesPath[0] + ' style="width: 55px; margin-right: 20px;';
    if (d.data.target_group) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"><img src=' + pt + targetImagesPath[2] + ' style="width: 55px; margin-right: 20px;';
    if (d.data.stereotype) {
        tooltipText += ' opacity: 1;';
    } else {
        tooltipText += ' opacity: 0.3;';
    }
    tooltipText += '"><br>';

    //If node is collapsed, we also want to add some information about its sons
    if (d._children) {
        tooltipText += "<br> <table>";

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
                "<td><b>" + sonTitles[i] + ":</b> " + sonValues[i] + "</td>";
            if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
        }
        tooltipText += "</table>";
    }
    tooltipText += "<br>" + d.data.coment;

    //Write growingFactor of node
    //Calculate tendencies and hierarchy of nodes
    var s = L;
    tooltipText += "<br><br><b>Growing Factor:</b> " + getGrowFactor(d,s)
                + "<br><b>ET:</b> " + elongatedTendency(d, s)
                + "&nbsp;&nbsp;&nbsp;&nbsp;<b>CT:</b> " + compactTendency(d, s, GFcomp) + "</div>";

    return tooltipText;
}

function writeTooltipRootCircle(d, totalNumberOfNodes, totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic) {

    var sonTitles = [
        "Direct comments",
        "Total number of generated comments",
        "Not toxic",
        "Mildly toxic",
        "Toxic",
        "Very toxic",
    ];
    var sonValues = [
        d.children ? d.children.length : 0,
        totalNumberOfNodes,
        totalNotToxic,
        totalMildlyToxic,
        totalToxic,
        totalVeryToxic,
    ];
    let tooltipText = "<br> <table>";

    for (i = 0; i < sonValues.length; i++) {
        if (i % 2 === 0) tooltipText += "<tr>"; //Start table line
        tooltipText +=
            "<td><b>" + sonTitles[i] + ":</b> " + sonValues[i] + "</td>";
        if ((i + 1) % 2 === 0) tooltipText += "</tr>"; //End table line
    }

    //Write growingFactor of root
    tooltipText += "</table>";
    var s = L;
    //Calculate hierarchy
    var t = d_lvl;
    //Calculate tendencies and hierarchy of nodes
    tooltipText += "<br><br><b>Growing Factor:</b> " + getGrowFactor(d,s)
                + "<br><b>ET:</b> " + elongatedTendency(d, s)
                + "&nbsp;&nbsp;&nbsp;&nbsp;<b>CT:</b> " + compactTendency(d, s, GFcomp)
                + "<br><b>Hierarchy:</b> " + getHierarchyName(d, s, GFcomp, t) + "<br>";

    // Add news information
    tooltipText += "<br> <table style=\" table-layout: fixed; width: 100%; word-wrap: break-word;\"><tr><td> <b>Title:</b> " + d.data.title + "</td></tr></table>" +
        "<br> <table style=\" table-layout: fixed; width: 100%; word-wrap: break-word;\"><tr><td> <b>Text URL:</b> <a href=" + d.data.text_URL + ">" + d.data.text_URL + "</a></td>" +
        "</tr>" +
        "<tr>" +
            "<td> <b>Comments URL:</b> <a href=" + d.data.comments_URL + ">" + d.data.comments_URL + "</a></td>" +
        "</tr></table>"
    tooltipText += "<br>";

    return tooltipText;
}

function deactivateFiltersCircle () {
    document.getElementById("dots_label").classList.add('disabled');
    document.getElementById("glyphs_label").classList.add('disabled');

    document.getElementById("check_button_targets").setAttribute('disabled', '');
    document.getElementById("uncheck_button_targets").setAttribute('disabled', '');
    document.getElementById("target-group").setAttribute('disabled', '');
    document.getElementById("target-person").setAttribute('disabled', '');
    document.getElementById("target-stereotype").setAttribute('disabled', '');

    document.getElementById("check_button_features").setAttribute('disabled', '');
    document.getElementById("uncheck_button_features").setAttribute('disabled', '');
    document.getElementById("constructiveness").setAttribute('disabled', '');
    document.getElementById("argumentation").setAttribute('disabled', '');
    document.getElementById("sarcasm").setAttribute('disabled', '');
    document.getElementById("mockery").setAttribute('disabled', '');
    document.getElementById("intolerance").setAttribute('disabled', '');
    document.getElementById("improper_language").setAttribute('disabled', '');
    document.getElementById("insult").setAttribute('disabled', '');
    document.getElementById("aggressiveness").setAttribute('disabled', '');
}

function activateFiltersCircle () {
    document.getElementById("dots_label").classList.remove('disabled');
    document.getElementById("glyphs_label").classList.remove('disabled');

    document.getElementById("check_button_targets").removeAttribute('disabled');
    document.getElementById("uncheck_button_targets").removeAttribute('disabled');
    document.getElementById("target-group").removeAttribute('disabled');
    document.getElementById("target-person").removeAttribute('disabled');
    document.getElementById("target-stereotype").removeAttribute('disabled');

    document.getElementById("check_button_features").removeAttribute('disabled');
    document.getElementById("uncheck_button_features").removeAttribute('disabled');
    document.getElementById("constructiveness").removeAttribute('disabled');
    document.getElementById("argumentation").removeAttribute('disabled');
    document.getElementById("sarcasm").removeAttribute('disabled');
    document.getElementById("mockery").removeAttribute('disabled');
    document.getElementById("intolerance").removeAttribute('disabled');
    document.getElementById("improper_language").removeAttribute('disabled');
    document.getElementById("insult").removeAttribute('disabled');
    document.getElementById("aggressiveness").removeAttribute('disabled');
}

function handleSimpleAjaxError(jqXHR, textStatus, errorThrown){
    if (jqXHR.status === 0) {
        alert('Not connect: Verify Network.');
    } else if (jqXHR.status === 404) {
        alert('Requested page not found [404]');
    } else if (jqXHR.status === 500) {
        alert('Internal Server Error [500].');
    } else if (textStatus === 'parsererror') {
        alert('Requested JSON parse failed.');
    } else if (textStatus === 'timeout') {
        alert('Time out error.');
    } else if (textStatus === 'abort') {
        alert('Ajax request aborted.');
    } else {
        alert('Uncaught Error: ' + jqXHR.responseText);
    }
}

/******************************
*       Complex Intents       *
*******************************/

function highlightLongestThread(nodes, root, opacityValue, deepestNodesPath, node, link) {

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

    highlightLongestThreadPopup(root, deepestNodesPath);
}

function highlightLongestThreadCircle(nodes, root, maxOpacityValue, minOpacityValue ,deepestNodesPath, node) {

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

    highlightLongestThreadPopup(root, deepestNodesPath, true);
}

function highlightLongestThreadPopup(root, deepestNodesPath, fromCircle = false){
    if (document.getElementById("from_popup_main_input").name === 'from_popup') {
        injectIntentConversation("The subtree is only displayed in a popup if the action is performed from the main graph");
        return;
    }
    let deepest_nodes_path = deepestNodesPath.filter(function (d) {
        return (d !== root);
    });

    var comment_ids;
    if (!fromCircle) {
        comment_ids = deepest_nodes_path.map(function(comment) {
          return comment['name'];
        });
    } else {
        comment_ids = deepest_nodes_path.map(function(comment) {
          return comment['data']['name'];
        });
    }


    document.getElementById("from_popup_main_input").name = 'from_main';
    document.getElementById("from_popup_main_input").value = 'interchange';

    document.getElementById("popupModal").subtree_node_ids = comment_ids;
    document.getElementById("popupModal").subtree_document_description = document.getElementById("dataset_dropdown").value;
    document.getElementById("popupModal").subtree_name = "";

    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
    formData.append('selected_data', document.getElementById("dataset_dropdown").value);
    formData.append('subtree_nodes_ids', comment_ids);
    formData.append('subtree_document_description', document.getElementById("dataset_dropdown").value);

    $.ajax({
        type: "POST",
        url: "/generate_dataset_popup/",
        data: formData,
        // handle a successful response
        success: function (data) {
            d3.json(data, function (error, treeData) {
                let root = treeData;
                var i = 0;

                function recurse(node, parent) {
                    node.parent = parent; //We assign a parent to the node
                    if (parent) node.depth = node.parent.depth + 1; //If parent is not null
                    if (node.children) node.children.forEach(element => recurse(element, node));
                    if (!node.id) node.id = ++i;
                }
                root.depth = 0;
                recurse(root, null);

                hierarchyName = getHierarchyName(root, L, GFcomp, d_lvl);
                datasetPopup = data;
                if (!document.getElementById("graph-container")) {
                    $("#popup-btn").click();
                } else {
                    document.getElementById("subtree-name").value = "";
                    document.querySelector(".modal .modal-footer").style.padding = "0.75rem";
                    document.getElementById("subtree-save-success").style.display = "none";
                    document.getElementById("subtree-save-error").style.display = "none";
                    document.getElementById("modal-info-alert").style.display = "none";
                    document.getElementById("modal-subtree-name").style.display = "none";
                    document.getElementById("send-popup-content").style.display = "block";
                    document.getElementById("add-subtree-form").style.display = "flex";
                    removeLayout();
                }
                $(popup_container).trigger("open");
            });
        },
        // handle a non-successful response
        error: function(jqXHR, textStatus, errorThrown) { // on error..
            if (jqXHR.status === 0) {
                alert('Not connect: Verify Network.');
            } else if (jqXHR.status === 400) {
                if (jqXHR.responseText === "document_not_exist") {
                    injectIntentConversation("Document could not be found");
                } else if (jqXHR.responseText === "open_document_no_active_session") {
                    injectIntentConversation("Please log in to perform this action");
                } else {
                    errorText = 'Bad Request [400]';
                }
            } else if (jqXHR.status === 404) {
                alert('Requested page not found [404]');
            } else if (jqXHR.status === 500) {
                alert('Internal Server Error [500].');
            } else if (textStatus === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (textStatus === 'timeout') {
                alert('Time out error.');
            } else if (textStatus === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error: ' + jqXHR.responseText);
            }
        },
        cache: false,
        contentType: false,
        processData: false,
    })
}

function highlightWidestLevels(nodes, opacityValue, node, link, levelsIndexes) {
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

function highlightWidestLevelsCircle(nodes, maxOpacityValue, minOpacityValue, node, levelsIndexes) {

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