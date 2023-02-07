var N = 25;
var L = 4;
var GFcomp = 0.25;
var GFelon = 2;
var d_lvl = 6;
var tol = 0.15;

var datasetPopup, hierarchyNamePopup, layoutNamePopup, hierarchyNameMain, layoutNameMain;

var chartModalData, chartSubModalData, chartModalDataPie, chartModalTitle, configBar, configBarSub, configHorizontalBar,
    configHorizontalBarSub, configPie, treeInfoChart, subtreesInfoChart;

var featuresChartDict = {"Constructive":"constructiveness", "Argument":"argumentation", "Sarcasm":"sarcasm", "Mockery":"mockery",
            "Intolerance":"intolerance", "Improper":"improper_language", "Insult":"insult", "Aggressive":"aggressiveness",
            "Group":"target-group","Person":"target-person","Stereotype":"target-stereotype"};

var featuresChartSubDict = {"Constructive":"highlight-features-constructiveness", "Argument":"highlight-features-argumentation",
            "Sarcasm":"highlight-features-sarcasm", "Mockery":"highlight-features-mockery",
            "Intolerance":"highlight-features-intolerance", "Improper":"highlight-features-improper-language",
            "Insult":"highlight-features-insult", "Aggressive":"highlight-features-aggressiveness",
            "Group":"highlight-target-group","Person":"highlight-target-person","Stereotype":"highlight-target-stereotype",
            "Neutral":"highlight-stance-neutral","Positive":"highlight-stance-positive","Negative":"highlight-stance-negative",
            "Not toxic":"highlight-toxicity-0","Mildly toxic":"highlight-toxicity-1","Toxic":"highlight-toxicity-2",
            "Very toxic":"highlight-toxicity-3",};

// Variable to share the name of the main window graph between multiple files
var mainWindowGraphName;

var highlightedSubgraph = null;

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

function highlightDevtoolsAND(nodes, root, node, link, enabledTargetsValue, N, L, GFcomp, GFelon, d_lvl, tol, opacityValue = 0.1) {

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

    statisticsDataChangedTree(root);
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
 * Find the length of the longest chain in a hierarchy
 * @param node tree root
 * @returns {number} length going to the root to the deepest node in the data structure
 */
function getLengthDeepestNodeCircle(node) {
    var hierarchy = d3v4.hierarchy(node);
    var longest = d3v4.max(hierarchy.descendants().map(function(d) {
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
 * Finding all the end nodes in a hierarchy
 * @param node tree root
 * @returns {Array} array of end nodes (which have no children)
 */
function getEndNodes(node) {
    let hierarchy = d3.hierarchy(node);
    return hierarchy.descendants().filter(function (d) {
        return (!d.children && d.data !== node);
    });
}

/**
 * Finding the largest nodes in a hierarchy
 * @param node tree root
 * @returns {Array} array of nodes with greater depth
 */
function getLargestNodes(node) {

    let children = node.children;
    let childrenTotalDescendantsList = [];

    if (children) {
        children.forEach(function (d) {
            childrenTotalDescendantsList.push(getDescendants(d).children);
        });
    }

    const max = Math.max(...childrenTotalDescendantsList);

    const largestNodesIndexes = [];

    for (let index = 0; index < childrenTotalDescendantsList.length; index++) {
      if (childrenTotalDescendantsList[index] === max) {
        largestNodesIndexes.push(children[index]);
      }
    }
    return [largestNodesIndexes, max + 1];
}

/**
 * Find the root nodes of the most toxic subtrees
 * @param node tree root
 * @param fromCircle indicates if the action is performed on the Circle Packing layout
 * @returns {Array} array of root nodes of the most toxic subtrees
 */
function getSubtreeMostToxicRootNodes(node, fromCircle = false) {

    let children = node.children;
    let childrenToxicityDescendantsList = [];

    if (children) {
        children.forEach(function (d) {
            if (fromCircle) {
                d = d.data;
            }
            childrenToxicityDescendantsList.push((getDescendants(d).toxicity1 + (getDescendants(d).toxicity2 * 2) + (getDescendants(d).toxicity3 * 3)));
        });
    }

    const max = Math.max(...childrenToxicityDescendantsList);

    const mostToxicRootNodes = [];

    for (let index = 0; index < childrenToxicityDescendantsList.length; index++) {
      if (childrenToxicityDescendantsList[index] === max) {
        mostToxicRootNodes.push(children[index]);
      }
    }
    return mostToxicRootNodes;
}

function getClickedSubtreeRootNode(root, nodeName, fromCircle) {
    var node;
    let children = root.children;
    if (children) {
        children.every(function (d) {
            if (fromCircle) {
                if (d.data.name === nodeName) {
                    node = d;
                    return false;
                }
            } else {
                if (d.name === nodeName) {
                    node = d;
                    return false;
                }
            }
            return true;
        });
    }
    return node;
}

/**
 * Recursive function to count the total number of descendants and
 * the total number of nodes by toxicity
 * */
function getDescendants(node) {

    if (!node.children) {
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

    var children = node.children;

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
 * Recursive function to obtain the total number of each characteristic of a graph
 * */
function getStatisticsDataSubtree(node, isSubtreeSearch = false) {
    if (!node.children) {
        return {
            // Features
            totalConstructiveness: 0,
            totalArgumentation: 0,
            totalSarcasm: 0,
            totalMockery: 0,
            totalIntolerance: 0,
            totalImproper_language: 0,
            totalInsult: 0,
            totalAggressiveness: 0,
            constructiveness: node.constructiveness,
            argumentation: node.argumentation,
            sarcasm: node.sarcasm,
            mockery: node.mockery,
            intolerance: node.intolerance,
            improper_language: node.improper_language,
            insult: node.insult,
            aggressiveness: node.aggressiveness,
            // Toxicity
            toxicityLevel: node.toxicity_level,
            toxicity0: 0,
            toxicity1: 0,
            toxicity2: 0,
            toxicity3: 0,
            // Target
            totalTargGroup: 0,
            totalTargPerson: 0,
            totalTargStereotype: 0,
            totalTargNone: 0,
            targGroup: node.target_group,
            targPerson: node.target_person,
            targStereotype: node.stereotype,
            targNone: 0,
            // Stance
            totalNeutralStance: 0,
            totalPositiveStance: 0,
            totalNegativeStance: 0,
            totalBothStances: 0,
            neutral_stance: (!node.positive_stance && !node.negative_stance),
            positive_stance: node.positive_stance,
            negative_stance: node.negative_stance,
            both_stances: (node.negative_stance && node.positive_stance)
        };
    }
    var childrenList = [],
        totalConstructiveness = 0, totalArgumentation = 0, totalSarcasm = 0, totalMockery = 0,
        totalIntolerance = 0, totalImproper_language = 0, totalInsult = 0, totalAggressiveness = 0,
        totalToxic0 = 0, totalToxic1 = 0, totalToxic2 = 0, totalToxic3 = 0,
        totalTargGroup = 0, totalTargPerson = 0, totalTargStereotype = 0, totalTargNone = 0,
        totalNeutralStance = 0, totalPositiveStance = 0, totalNegativeStance = 0, totalBothStances = 0;

    if (node.children) {
        node.children.forEach(function (d) {
            childrenList = getStatisticsDataSubtree(d, isSubtreeSearch);

            totalToxic0 += childrenList.toxicity0;
            totalToxic1 += childrenList.toxicity1;
            totalToxic2 += childrenList.toxicity2;
            totalToxic3 += childrenList.toxicity3;

            if (d.highlighted || isSubtreeSearch) {
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

            // If it is a request about subtrees, we count the features even if the node is not highlighted.
            childrenList.constructiveness && (d.highlighted || isSubtreeSearch) ? totalConstructiveness += childrenList.totalConstructiveness + 1 : totalConstructiveness += childrenList.totalConstructiveness;
            childrenList.argumentation && (d.highlighted || isSubtreeSearch) ? totalArgumentation += childrenList.totalArgumentation + 1 : totalArgumentation += childrenList.totalArgumentation;
            childrenList.sarcasm && (d.highlighted || isSubtreeSearch) ? totalSarcasm += childrenList.totalSarcasm + 1 : totalSarcasm += childrenList.totalSarcasm;
            childrenList.mockery && (d.highlighted || isSubtreeSearch) ? totalMockery += childrenList.totalMockery + 1 : totalMockery += childrenList.totalMockery;
            childrenList.intolerance && (d.highlighted || isSubtreeSearch) ? totalIntolerance += childrenList.totalIntolerance + 1 : totalIntolerance += childrenList.totalIntolerance;
            childrenList.improper_language && (d.highlighted || isSubtreeSearch) ? totalImproper_language += childrenList.totalImproper_language + 1 : totalImproper_language += childrenList.totalImproper_language;
            childrenList.insult && (d.highlighted || isSubtreeSearch) ? totalInsult += childrenList.totalInsult + 1 : totalInsult += childrenList.totalInsult;
            childrenList.aggressiveness && (d.highlighted || isSubtreeSearch) ? totalAggressiveness += childrenList.totalAggressiveness + 1 : totalAggressiveness += childrenList.totalAggressiveness;
            childrenList.neutral_stance && (d.highlighted || isSubtreeSearch) ? totalNeutralStance += childrenList.totalNeutralStance + 1 : totalNeutralStance += childrenList.totalNeutralStance;
            childrenList.both_stances && (d.highlighted || isSubtreeSearch) ? totalBothStances += childrenList.totalBothStances + 1 : totalBothStances += childrenList.totalBothStances;
            childrenList.positive_stance && (d.highlighted || isSubtreeSearch) ? totalPositiveStance += childrenList.totalPositiveStance + 1 : totalPositiveStance += childrenList.totalPositiveStance;
            childrenList.negative_stance && (d.highlighted || isSubtreeSearch) ? totalNegativeStance += childrenList.totalNegativeStance + 1 : totalNegativeStance += childrenList.totalNegativeStance;
            childrenList.targGroup && (d.highlighted || isSubtreeSearch) ? totalTargGroup += childrenList.totalTargGroup + 1 : totalTargGroup += childrenList.totalTargGroup;
            childrenList.targPerson && (d.highlighted || isSubtreeSearch) ? totalTargPerson += childrenList.totalTargPerson + 1 : totalTargPerson += childrenList.totalTargPerson;
            childrenList.targStereotype && (d.highlighted || isSubtreeSearch) ? totalTargStereotype += childrenList.totalTargStereotype + 1 : totalTargStereotype += childrenList.totalTargStereotype;
            (!childrenList.targGroup && !childrenList.targPerson && !childrenList.targStereotype && (d.highlighted || isSubtreeSearch)) ? totalTargNone += childrenList.totalTargNone + 1 : totalTargNone += childrenList.totalTargNone;
        })
    }

    return {
        // Features
        totalConstructiveness: totalConstructiveness,
        totalArgumentation: totalArgumentation,
        totalSarcasm: totalSarcasm,
        totalMockery: totalMockery,
        totalIntolerance: totalIntolerance,
        totalImproper_language: totalImproper_language,
        totalInsult: totalInsult,
        totalAggressiveness: totalAggressiveness,
        constructiveness: node.constructiveness,
        argumentation: node.argumentation,
        sarcasm: node.sarcasm,
        mockery: node.mockery,
        intolerance: node.intolerance,
        improper_language: node.improper_language,
        insult: node.insult,
        aggressiveness: node.aggressiveness,
        // Toxicity
        toxicityLevel: node.toxicity_level,
        toxicity0: totalToxic0,
        toxicity1: totalToxic1,
        toxicity2: totalToxic2,
        toxicity3: totalToxic3,
        // Target
        totalTargGroup: totalTargGroup,
        totalTargPerson: totalTargPerson,
        totalTargStereotype: totalTargStereotype,
        totalTargNone: totalTargNone,
        targGroup: node.target_group,
        targPerson: node.target_person,
        targStereotype: node.stereotype,
        targNone: 0,
        // Stance
        totalNeutralStance: totalNeutralStance,
        totalPositiveStance: totalPositiveStance,
        totalNegativeStance: totalNegativeStance,
        totalBothStances: totalBothStances,
        neutral_stance: (!node.positive_stance && !node.negative_stance),
        positive_stance: node.positive_stance,
        negative_stance: node.negative_stance,
        both_stances: (node.negative_stance && node.positive_stance)
    };
}

/**
 * Finding the deepest nodes in a hierarchy
 * @param node tree root
 * @returns {Array} array of nodes with greater depth
 */
function getDeepestNodesCircle(node) {
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
 * Find all descendants of all nodes in the list
 * @param root tree root
 * @param nodes array of nodes
 * @returns {Array} array of nodes containing all the descendant nodes, which together form the largest threads
 */
function getDescendantsListNodes(root, nodes) {
    let nodesPath = [];

    for (let i = 0; i < nodes.length; i++) {
        getNodesDescendants(nodes[i], nodesPath);
    }

    nodesPath.push(root);
    return nodesPath;
}

/**
 * Find the nodes belonging to the most toxic thread
 * @param root tree root
 * @param nodes array containing the end nodes of the graph
 * @param fromCircle indicates if the action is performed on the Circle Packing layout
 * @returns {Array} array of nodes containing all the nodes belonging to the most toxic thread
 */
function getMostToxicThreadPath(root, nodes, fromCircle = false) {
    let nodesPathToxicityNum = Array(nodes.length).fill(0);
    let nodesPathToxicity = Array.from(Array(nodes.length), () => new Array(0));

    for (let i = 0; i < nodes.length; i++) {
        if (!fromCircle) {
            while(nodes[i].data !== root){
                nodesPathToxicityNum[i] += nodes[i].data.toxicity_level
                nodesPathToxicity[i].push(nodes[i].data);
                nodes[i] = nodes[i].parent;
            }
        } else {
            while(nodes[i].data.data !== root.data){
                nodesPathToxicityNum[i] += nodes[i].data.data.toxicity_level
                nodesPathToxicity[i].push(nodes[i].data);
                nodes[i] = nodes[i].parent;
            }
        }
    }

    const max = Math.max(...nodesPathToxicityNum);
    let numThreads = 0;

    let finalNodesPath = [];

    for (let index = 0; index < nodesPathToxicityNum.length; index++) {
      if (nodesPathToxicityNum[index] === max) {
          finalNodesPath = finalNodesPath.concat(nodesPathToxicity[index]);
          numThreads++;
      }
    }
    finalNodesPath = finalNodesPath.concat([root]);
    return [finalNodesPath, max, numThreads];
}

// Auxiliary function to find all the descendants of a given node
function getNodesDescendants(node, nodesPath) {

    nodesPath.push(node);
    let children = node.children;

    if (children) {
        children.forEach(function (d) {
            getNodesDescendants(d, nodesPath);
        });
    }
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
    for (let i = 0; i < nodeList.length; i++) {
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
    if (height === 0) { return [[],0]; }
    getNodesInLevel(node, 0, height, nodeList);
    const max = Math.max(...nodeList);
    const indexes = [];
    for (let index = 1; index < nodeList.length; index++) {
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

    tooltipText += "<ul class='tooltip-features'>";

    for (let i = 0; i < featuresValues.length ; i++) {
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

        for (let i = 0; i < sonValues.length; i++) {
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

function writeTooltipRoot(d, numberOfDirectNodes, totalNumberOfNodes, totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic) {

    var sonTitles = [
        "Direct comments",
        "Total number of generated comments",
        "Not toxic",
        "Mildly toxic",
        "Toxic",
        "Very toxic",
    ];
    var sonValues = [
        numberOfDirectNodes,
        totalNumberOfNodes,
        totalNotToxic,
        totalMildlyToxic,
        totalToxic,
        totalVeryToxic,
    ];
    let tooltipText = "<br> <table>";

    for (let i = 0; i < sonValues.length; i++) {
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

    tooltipText += "<ul class='tooltip-features'>";

    for (let i = 0; i < featuresValues.length ; i++) {
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

        for (let i = 0; i < sonValues.length; i++) {
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

function writeTooltipRootCircle(d, numberOfDirectNodes, totalNumberOfNodes, totalNotToxic, totalMildlyToxic, totalToxic, totalVeryToxic) {

    var sonTitles = [
        "Direct comments",
        "Total number of generated comments",
        "Not toxic",
        "Mildly toxic",
        "Toxic",
        "Very toxic",
    ];
    var sonValues = [
        numberOfDirectNodes,
        totalNumberOfNodes,
        totalNotToxic,
        totalMildlyToxic,
        totalToxic,
        totalVeryToxic,
    ];
    let tooltipText = "<br> <table>";

    for (let i = 0; i < sonValues.length; i++) {
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
    document.getElementById("trivial_label").classList.add('disabled');

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
    document.getElementById("trivial_label").classList.remove('disabled');

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

function writeStatisticText(root, fromCircle = false) {
    var statisticText = "<table style='width: 530px; margin-top: 50px; z-index: 100;'>";

    let listStatisticsUpdate
    if (!fromCircle) {
        listStatisticsUpdate = getStatisticValues(root);
    } else {
        listStatisticsUpdate = getStatisticValuesCircle(root);
    }


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

/******************************
*       Complex Intents       *
*******************************/

function highlightThreadPopup(nodes, root, opacityValue, nodesPath, node, link, sendToPopup = true, isSubgraphByID = false) {

    nodes.forEach(function (d) {
        d.highlighted = 0;
    });
    node.style("opacity", opacityValue);

    node.filter(function (d) {
        if (nodesPath.includes(d)) d.highlighted = 1;
        return (nodesPath.includes(d));
    }).style("opacity", 1);

    //Highlight only the edges whose both endpoints are highlighted
    link.style("opacity", function (d) {
        return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
    });

    statisticsDataChangedTree(root, false, isSubgraphByID);

    if (sendToPopup){
        subtreeToPopup(root, nodesPath);
    }
}

function highlightThreadPopupCircle(nodes, root, maxOpacityValue, minOpacityValue ,nodesPath, node, sendToPopup = true, isSubgraphByID = false) {

    nodes.forEach(function (d) {
        d.data.highlighted = 1;
    });

    node.style("opacity", maxOpacityValue);

    node.filter(function (d) {
        let result = !nodesPath.includes(d);
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

    statisticsDataChangedTree(root, true, isSubgraphByID);

    if (sendToPopup){
        subtreeToPopup(root, nodesPath, true);
    }
}

function subtreeToPopup(root, nodesPath, fromCircle = false){

    let nodes_path = nodesPath.filter(function (d) {
        return (d !== root);
    });

    var comment_ids;
    if (!fromCircle) {
        comment_ids = nodes_path.map(function(comment) {
          return comment['name'];
        });
    } else {
        comment_ids = nodes_path.map(function(comment) {
          return comment['data']['name'];
        });
    }

    document.getElementById("popup_graph_info").value = 'subtree';
    document.getElementById("popup_subtree_nodes_ids").value = comment_ids;
    document.getElementById("popup_subtree_name").value = "";
    document.getElementById("popup_subtree_document_description").value = document.getElementById("main_subtree_document_description").value;
    document.getElementById("popup_subtree_id").value = "";

    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);
    formData.append('popup_subtree_nodes_ids', comment_ids);
    formData.append('popup_subtree_document_description', document.getElementById("main_subtree_document_description").value);

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

                hierarchyNamePopup = getHierarchyName(root, L, GFcomp, d_lvl);
                datasetPopup = data;

                switch(hierarchyNamePopup) {
                  case "Unspecified": case "nCompact": case "Hybrid":
                    layoutNamePopup = "force";
                    break;
                  case "Elongated":
                    layoutNamePopup = "tree";
                    break;
                  case "Compact":
                    layoutNamePopup = "radial";
                    break;
                }

                document.getElementById("popup_hierarchy_name").value = hierarchyNamePopup;
                document.getElementById("popup_layout_name").value = layoutNamePopup;

                if (!document.getElementById("graph-container")) {
                    $("#popup-btn").click();
                } else {
                    document.getElementById("subtree-name").value = "";
                    document.querySelector("#popupModal.modal .modal-footer").style.padding = "0.75rem";
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
                    injectTextConversation("Document could not be found");
                } else if (jqXHR.responseText === "open_document_no_active_session") {
                    injectTextConversation("Please log in to perform this action");
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

function check_first_request_popup(){
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', document.getElementsByName('csrfmiddlewaretoken')[0].value);

    $.ajax({
        type: "POST",
        url: "/check_first_request_popup/",
        data: formData,
        // handle a successful response
        success: function (data) {
            if (data === "true") {
                injectTextConversation("I highlighted it on the main view. " +
                    "Also, I displayed it separately on a pop-up window.\n\nNow the active window is the pop-up that is " +
                    "highlighted with a blue frame. You can switch the active window by selecting the main window. " +
                    "Don't forget I will give answers to your questions considering the active window!");
            }
        },
        cache: false,
        contentType: false,
        processData: false,
    })
}

function highlightWidestLevels(nodes, opacityValue, node, link, levelsIndexes, root) {
    nodes.forEach(function (d) {
        d.highlighted = 0;
    });
    node.style("opacity", opacityValue);

    node.filter(function (d) {
        if (levelsIndexes.includes(d.depth) || d.depth === 0) d.highlighted = 1;
        return (levelsIndexes.includes(d.depth) || d.depth === 0);
    }).style("opacity", 1);

    //Highlight only the edges whose both endpoints are highlighted
    link.style("opacity", function (d) {
        return d.source.highlighted && d.target.highlighted ? 1 : opacityValue;
    });

    statisticsDataChangedTree(root);
}

function highlightWidestLevelsCircle(nodes, maxOpacityValue, minOpacityValue, node, levelsIndexes, root) {

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

    statisticsDataChangedTree(root, true);
}

function widestLevelHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link) {
    let widestLevels = getWidestLevels(root, getTreeHeight(root));
    var textMsg;
    if (widestLevels[0].length === 0) {
        textMsg = "There are no threads in this graph";
    } else if (widestLevels[0].length > 1) {
        textMsg = "There are " + widestLevels[0].length + " levels (" + widestLevels[0] + ") with a maximum width of " + widestLevels[1];
    } else {
        textMsg = "The widest level is level " + widestLevels[0][0] + " which has a width of " + widestLevels[1];
    }

    injectTextConversation(textMsg);

    highlightWidestLevels(nodes, opacityValue, node, link, widestLevels[0], root);

    if (static_values_checked) {
        statisticBackground.html(writeStatisticText(root, false));
    }
}

function longestThreadHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link) {
    let deepestNodes = getDeepestNodes(root);
    let deepestNodesPath;

    var textMsg;
    if (deepestNodes[0].depth === 0) {
        textMsg = "There are no threads in this graph";
    } else if (deepestNodes.length > 1) {
        textMsg = "There are " + deepestNodes.length + " threads with a maximum depth of " + deepestNodes[0].depth;
    } else {
        textMsg = "The longest thread has a depth of " + deepestNodes[0].depth;
    }

    injectTextConversation(textMsg);

    if (deepestNodes[0].depth > 0) {

        deepestNodesPath = getDeepestNodesPath(root, deepestNodes);

        highlightThreadPopup(nodes, root, opacityValue, deepestNodesPath, node, link);

        if (static_values_checked) {
            statisticBackground.html(writeStatisticText(root));
        }
    }
}

function largestThreadHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link) {
    let result = getLargestNodes(root);
    let largestThreads = result[0]
    let numNodes = result[1];
    let largestNodesPath;

    var textMsg;
    if (largestThreads.length < 1) {
        textMsg = "There are no threads in this graph";
    } else if (largestThreads.length > 1) {
        textMsg = "There are " + largestThreads.length + " threads with a total of " + numNodes + " nodes each";
    } else {
        textMsg = "The largest thread has a total of " + numNodes + " nodes";
    }

    injectTextConversation(textMsg);

    if (largestThreads.length > 0) {

        largestNodesPath = getDescendantsListNodes(root, largestThreads);

        highlightThreadPopup(nodes, root, opacityValue, largestNodesPath, node, link);

        if (static_values_checked) {
            statisticBackground.html(writeStatisticText(root));
        }
    }
}

function mostToxicThreadHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link) {
    let endNodes = getEndNodes(root);
    let mostToxicNodesPath;

    if (endNodes.length < 1) {
        injectTextConversation("There are no threads in this graph");
    } else {
        mostToxicNodesPath = getMostToxicThreadPath(root, endNodes);

        if (mostToxicNodesPath[1] === 0) {
            injectTextConversation("There are no toxic threads in this graph");
        } else {
            let textMsg;
            if (mostToxicNodesPath[2] === 1) {
                textMsg = "There is only one thread with this level of toxicity";
            } else {
                textMsg = "There are " + mostToxicNodesPath[2] + " threads with the same maximum level of toxicity";
            }
            injectTextConversation(textMsg);
            highlightThreadPopup(nodes, root, opacityValue, mostToxicNodesPath[0], node, link);

            if (static_values_checked) {
                statisticBackground.html(writeStatisticText(root));
            }
        }
    }
}

function mostToxicSubtreeHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link) {
    let rootNodes = getSubtreeMostToxicRootNodes(root);
    let mostToxicNodesPath;

    var textMsg;
    if (rootNodes.length < 1) {
        textMsg = "There are no threads in this graph";
    } else if (rootNodes.length > 1) {
        textMsg = "There are " + rootNodes.length + " subtrees with the same maximum level of toxicity";
    } else {
        textMsg = "There is only one subtree with the maximum level of toxicity";
    }

    injectTextConversation(textMsg);

    if (rootNodes.length > 0) {

        mostToxicNodesPath = getDescendantsListNodes(root, rootNodes);

        highlightThreadPopup(nodes, root, opacityValue, mostToxicNodesPath, node, link);

        if (static_values_checked) {
            statisticBackground.html(writeStatisticText(root));
        }
    }
}

function createChartModal(isPopupSelected) {

    if (isPopupSelected === null) {
        let selectedContainer = document.getElementById("selected_container").value;
        if (selectedContainer === "main" || selectedContainer === "") {
            isPopupSelected = false;
        } else if (selectedContainer === "popup") {
            isPopupSelected = true;
        }
    }

    let chart = document.getElementById('chart-modal-body').getContext('2d');

    if (!isPopupSelected) {
        document.querySelector("#chartModal .modal-title").innerHTML = "Statistics of " + mainWindowGraphName;
    } else {
        let popupGraphName;
        if (document.getElementById("popup_graph_info").value && document.getElementById("popup_graph_info").value !== 'complete') {
            if (document.getElementById("popup_subtree_name").value) {
                popupGraphName = document.getElementById("popup_subtree_name").value;
            } else {
                popupGraphName = "Subtree";
            }
        } else {
            popupGraphName = document.getElementById("dataset_dropdown").value;
        }

        document.querySelector("#chartModal .modal-title").innerHTML = "Statistics of " + popupGraphName;
    }

    document.getElementById('chart-modal-body').classList.remove("square-chart");
    let chartType = document.getElementById('select-chart-type-modal').value;
    if (Chart.getChart('chart-modal-body')) {
        Chart.getChart('chart-modal-body').destroy();
    }
    let canvas = document.getElementById('chart-modal-body');

    configPie = {
        type: 'pie',
        data: chartModalDataPie,
        options: {
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  position: 'right',
              },
              title: {
                  display: false,
              }
          },
        }
    }

    configBar = {
        type: 'bar',
        data: chartModalData,
        options: {
          maintainAspectRatio: false,
          scales: {
              y: {
                  beginAtZero: true
              }
          },
          plugins: {
              legend: {
                  position: 'right',
              },
              title: {
                  display: false,
              }
          },
        }
    }

    configHorizontalBar = {
        type: 'bar',
        data: chartModalData,
        options: {
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
              y: {
                  beginAtZero: true
              }
          },
          plugins: {
              legend: {
                  position: 'right',
              },
              title: {
                  display: false,
              }
          },
        }
    }

    if (chartType === 'bar') {
        treeInfoChart = new Chart(chart, configBar);
    } else if (chartType === 'horizontal_bar') {
        treeInfoChart = new Chart(chart, configHorizontalBar);
    } else if(chartType === 'pie') {
        treeInfoChart = new Chart(chart, configPie);
    }

    function clickHandler(evt) {
        const points = treeInfoChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            var label = treeInfoChart.data.labels[firstPoint.index];
            if (!Object.keys(featuresChartDict).includes(label)) {
                label = treeInfoChart.data.datasets[firstPoint.datasetIndex].label;
                if (!Object.keys(featuresChartDict).includes(label)) {
                    return;
                }
            }
            document.getElementById(featuresChartDict[label]).click();
        }
    }

    canvas.onclick = clickHandler;
    if (!document.getElementById('chartModal').classList.contains('show')) {
        document.getElementById("chartModal").style.top = "calc(100% - 330px)";
        document.getElementById("chartModal").style.left = "calc(50% - 262px)";
        document.querySelector("#chartModal .modal-content").style.width = "525px";
        document.querySelector("#chartModal .modal-content").style.height = "305px";
        $("#popup-chart-btn").click();
    }
}
function createChartSubModal(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected) {

    if (isPopupSelected === null) {
        let selectedContainer = document.getElementById("selected_container").value;
        if (selectedContainer === "main" || selectedContainer === "") {
            isPopupSelected = false;
        } else if (selectedContainer === "popup") {
            isPopupSelected = true;
        }
    }

    let chart = document.getElementById('chart-sub-modal-body').getContext('2d');

    if (!isPopupSelected) {
        document.querySelector("#chartSubModal .modal-title").innerHTML = "Statistics of " + mainWindowGraphName + " subgraphs";
    } else {
        let popupGraphName;
        if (document.getElementById("popup_graph_info").value && document.getElementById("popup_graph_info").value !== 'complete') {
            if (document.getElementById("popup_subtree_name").value) {
                popupGraphName = document.getElementById("popup_subtree_name").value;
            } else {
                popupGraphName = "Subtree";
            }
        } else {
            popupGraphName = document.getElementById("dataset_dropdown").value;
        }

        document.querySelector("#chartSubModal .modal-title").innerHTML = "Statistics of " + popupGraphName + " subgraphs";
    }

    let chartType = document.getElementById('select-chart-sub-type-modal');
    if (Chart.getChart('chart-sub-modal-body')) {
        Chart.getChart('chart-sub-modal-body').destroy();
    }
    let canvas = document.getElementById('chart-sub-modal-body');

    configBarSub = {
        type: 'bar',
        data: chartSubModalData,
        options: {
          maintainAspectRatio: false,
          scales: {
              y: {
                  beginAtZero: true
              }
          },
          plugins: {
              legend: {
                  position: 'left',
                  align: 'center',
              },
              title: {
                  display: false,
              }
          },
        }
    }

    configHorizontalBarSub = {
        type: 'bar',
        data: chartSubModalData,
        options: {
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
              y: {
                  beginAtZero: true,
              },
              x: {
                  position: 'top',
              }
          },
          plugins: {
              legend: {
                  position: 'top',
                  align: 'center',
              },
              title: {
                  display: false,
              }
          },
        }
    }

    if (chartType.value === 'bar') {
        subtreesInfoChart = new Chart(chart, configBarSub);
        let chartBody = document.querySelector("#chartSubModal .chart-sub-body");
        let modalBody = document.querySelector("#chartSubModal .modal-body");
        let totalLabels = subtreesInfoChart.data.labels.length;
        chartBody.style.width = "";
        if (totalLabels > 4) {
            let newWidth = 509 + ((totalLabels - 4) * 75);
            chartBody.style.width = `${newWidth}px`;
        }
        chartBody.style.height = '100%';
        modalBody.style.overflowY = "visible";
        modalBody.style.overflowX = "scroll";
        modalBody.style.marginRight = "1rem";
        modalBody.style.marginBottom = "0";
    } else if (chartType.value === 'horizontal_bar') {
        subtreesInfoChart = new Chart(chart, configHorizontalBarSub);
        let chartBody = document.querySelector("#chartSubModal .chart-sub-body");
        let modalBody = document.querySelector("#chartSubModal .modal-body");
        let totalLabels = subtreesInfoChart.data.labels.length;
        if (totalLabels > 4) {
            let newHeight = 218 + ((totalLabels - 4) * 42);
            chartBody.style.height = `${newHeight}px`;
        }
        chartBody.style.width = '100%';
        modalBody.style.overflowX = "visible";
        modalBody.style.overflowY = "scroll";
        modalBody.style.marginBottom = "1rem";
        modalBody.style.marginRight = "0";
    }

    function clickHandlerSub(evt) {
        const points = subtreesInfoChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            var label = subtreesInfoChart.data.labels[firstPoint.index];
            if (!Object.keys(featuresChartSubDict).includes(label)) {
                label = subtreesInfoChart.data.datasets[firstPoint.datasetIndex].label;
                if (!Object.keys(featuresChartSubDict).includes(label)) {
                    return;
                }
            }
            document.getElementById(featuresChartSubDict[label]).click();
        }
        let type = document.getElementById('select-chart-sub-type-modal');
        if(type.value === 'bar') {
            clickableBarSubtreeLabels(canvas, evt);
        } else if (type.value === 'horizontal_bar') {
            clickableHorizontalSubtreeLabels(subtreesInfoChart, evt);
        }
    }
    function clickableHorizontalSubtreeLabels(chart, click) {
        const { ctx, canvas, scales: {x,y} } = chart
        const top = y.top;
        const left = y.left;
        const right = y.right;
        const bottom = y.bottom;
        const height = y.height / y.ticks.length;
        let rect = canvas.getBoundingClientRect();
        const xCoor = click.clientX - rect.left;
        const yCoor = click.clientY - rect.top;

        for(let i = 0; i < y.ticks.length; i++) {
            if(xCoor >= left && xCoor <= right && yCoor >= top + (height * i) && yCoor <= top + height + (height * i)) {
                clickSubtreeChartHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link, chart.config.data.labelsIDs[i], fromCircle, minOpacityValue);
            }
        }
    }

    function clickableBarSubtreeLabels(canvas, click) {
        const height = subtreesInfoChart.scales.x.height;
        const top = subtreesInfoChart.scales.x.top;
        const bottom = subtreesInfoChart.scales.x.bottom;
        const left = subtreesInfoChart.scales.x.left;
        const right = subtreesInfoChart.scales.x.maxWidth / subtreesInfoChart.scales.x.ticks.length;
        let resetCoordinates = canvas.getBoundingClientRect();
        const x = click.clientX - resetCoordinates.left;
        const y = click.clientY - resetCoordinates.top;

        for(let i = 0; i < subtreesInfoChart.scales.x.ticks.length; i++) {
            if(x >= left + (right * i) && x <= (right+left) + (right * i) && y >= top && y <= bottom) {
                clickSubtreeChartHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link, subtreesInfoChart.config.data.labelsIDs[i], fromCircle, minOpacityValue);
            }
        }
    }

    if (!isPopupSelected) {
        $("#chart-sub-modal-body").off('click').click(clickHandlerSub);
    } else {
        $("#chart-sub-modal-body").off('click');
    }
    if (!document.getElementById('chartSubModal').classList.contains('show')) {
        document.getElementById("chartSubModal").style.top = "calc(100% - 377px)";
        document.getElementById("chartSubModal").style.left = "calc(50% - 262px)";
        document.querySelector("#chartSubModal .modal-content").style.width = "525px";
        document.querySelector("#chartSubModal .modal-content").style.height = "305px";
        $("#popup-chart-sub-btn").click();
    }
}

function renderChartType(type, id){
    let chart = document.getElementById(id).getContext('2d');
    Chart.getChart(id).destroy();
    document.getElementById(id).classList.remove("square-chart");
    if(type.value === 'pie') {
        treeInfoChart = new Chart(chart, configPie);
        document.getElementById(id).classList.add("square-chart");
    } else if(type.value === 'bar') {
        if (id === "chart-modal-body") {
            treeInfoChart = new Chart(chart, configBar);
        } else if (id === "chart-sub-modal-body") {
            subtreesInfoChart = new Chart(chart, configBarSub);
            let chartBody = document.querySelector("#chartSubModal .chart-sub-body");
            let modalBody = document.querySelector("#chartSubModal .modal-body");
            let totalLabels = subtreesInfoChart.data.labels.length;
            if (totalLabels > 4) {
                let newWidth = 509 + ((totalLabels - 4) * 75);
                chartBody.style.width = `${newWidth}px`;
            }
            chartBody.style.height = '100%';
            modalBody.style.overflowY = "visible";
            modalBody.style.overflowX = "scroll";
            modalBody.style.marginRight = "1rem";
            modalBody.style.marginBottom = "0";
        }
    } else if (type.value === 'horizontal_bar') {
        if (id === "chart-modal-body") {
            treeInfoChart = new Chart(chart, configHorizontalBar);
        } else if (id === "chart-sub-modal-body") {
            subtreesInfoChart = new Chart(chart, configHorizontalBarSub);
            let chartBody = document.querySelector("#chartSubModal .chart-sub-body");
            let modalBody = document.querySelector("#chartSubModal .modal-body");
            let totalLabels = subtreesInfoChart.data.labels.length;
            if (totalLabels > 4) {
                let newHeight = 218 + ((totalLabels - 4) * 42);
                chartBody.style.height = `${newHeight}px`;
            }
            chartBody.style.width = '100%';
            modalBody.style.overflowX = "visible";
            modalBody.style.overflowY = "scroll";
            modalBody.style.marginBottom = "1rem";
            modalBody.style.marginRight = "0";
        }
    }
}

function renderChartData(data, id){
    if (data.value === 'toxicity') {
        if (id === "chart-modal-body") {
            $(window).trigger('statistics_toxicity_tree');
        } else if (id === "chart-sub-modal-body") {
            $(window).trigger('statistics_toxicity_subtrees');
        }
    } else if(data.value === 'stance') {
        if (id === "chart-modal-body") {
            $(window).trigger('statistics_stance_tree');
        } else if (id === "chart-sub-modal-body") {
            $(window).trigger('statistics_stance_subtrees');
        }
    } else if(data.value === 'target') {
        if (id === "chart-modal-body") {
            $(window).trigger('statistics_target_tree');
        } else if (id === "chart-sub-modal-body") {
            $(window).trigger('statistics_target_subtrees');
        }
    } else if(data.value === 'features') {
        if (id === "chart-modal-body") {
            $(window).trigger('statistics_all_features_tree');
        } else if (id === "chart-sub-modal-body") {
            $(window).trigger('statistics_all_features_subtrees');
        }
    }
}

function statisticsToxicityTree(root, fromCircle = false, isPopupSelected = null) {

    if (fromCircle) {
        root = root.data;
    }

    var listStatistics = getStatisticsDataSubtree(root);

    chartModalData = {
      labels: [''],
      datasets: [{
        label: 'Not toxic',
        data: [listStatistics.toxicity0],
        backgroundColor: "#F0F0F0",
      },
      {
        label: 'Mildly toxic',
        data: [listStatistics.toxicity1],
        backgroundColor: "#cccccc",
      },
      {
        label: 'Toxic',
        data: [listStatistics.toxicity2],
        backgroundColor: "#737373",
      },
      {
        label: 'Very toxic',
        data: [listStatistics.toxicity3],
        backgroundColor: "#000000",
      }]
    }

    chartModalDataPie = {
      labels: ['Not toxic', 'Mildly toxic', 'Toxic', 'Very toxic'],
      datasets: [{
        label: 'total',
        data: [listStatistics.toxicity0, listStatistics.toxicity1, listStatistics.toxicity2, listStatistics.toxicity3],
        backgroundColor: ["#F0F0F0", "#cccccc", "#737373", "#000000"],
      }]
    }
    chartModalTitle = 'complete_graph';

    createChartModal(isPopupSelected);
}

function statisticsStanceTree(root, fromCircle = false, isPopupSelected = null) {

    if (fromCircle) {
        root = root.data;
    }

    var listStatistics = getStatisticsDataSubtree(root);

    chartModalData = {
      labels: [''],
      datasets: [{
        label: 'Neutral',
        data: [listStatistics.totalNeutralStance],
        backgroundColor: "#2b2727",
      },
      {
        label: 'Positive',
        data: [listStatistics.totalPositiveStance],
        backgroundColor: "#77dd77",
      },
      {
        label: 'Negative',
        data: [listStatistics.totalNegativeStance],
        backgroundColor: "#ff6961",
      },
      {
        label: 'Both',
        data: [listStatistics.totalBothStances],
        backgroundColor: "#FFA500",
      }]
    }

    chartModalDataPie = {
      labels: ['Neutral', 'Positive', 'Negative', 'Both'],
      datasets: [{
        label: 'total',
        data: [listStatistics.totalNeutralStance, listStatistics.totalPositiveStance, listStatistics.totalNegativeStance,
            listStatistics.totalBothStances],
        backgroundColor: ["#2b2727", "#77dd77", "#ff6961", "#FFA500"],
      }]
    }
    chartModalTitle = 'complete_graph';

    createChartModal(isPopupSelected);
}

function statisticsTargetTree(root, fromCircle = false, isPopupSelected = null) {

    if (fromCircle) {
        root = root.data;
    }

    var listStatistics = getStatisticsDataSubtree(root);

    chartModalData = {
      labels: [''],
      datasets: [{
        label: 'Group',
        data: [listStatistics.totalTargGroup],
        backgroundColor: "#bf7f81",
      },
      {
        label: 'Person',
        data: [listStatistics.totalTargPerson],
        backgroundColor: "#606984",
      },
      {
        label: 'Stereotype',
        data: [listStatistics.totalTargStereotype],
        backgroundColor: "#798c8f",
      },
      {
        label: 'None',
        data: [listStatistics.totalTargNone],
        backgroundColor: "#303133",
      }]
    }

    chartModalDataPie = {
      labels: ['Group', 'Person', 'Stereotype', 'None'],
      datasets: [{
        label: 'total',
        data: [listStatistics.totalTargGroup, listStatistics.totalTargPerson, listStatistics.totalTargStereotype,
            listStatistics.totalTargNone],
        backgroundColor: ["#bf7f81", "#606984", "#798c8f", "#303133"],
      }]
    }
    chartModalTitle = 'complete_graph';

    createChartModal(isPopupSelected);
}

function statisticsToxicitySubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle = false, minOpacityValue = null, isPopupSelected = null) {

    let children = root.children;
    let listStatistics;
    let labelsSubtrees = [];
    let labelsSubtreesIDs = [];
    let notToxicSubtrees = [];
    let mildlyToxicSubtrees = [];
    let toxicSubtrees = [];
    let veryToxicSubtrees = [];

    if (children) {
        children.forEach(function (d) {
            if (fromCircle) {
                d = d.data;
            }
            labelsSubtrees.push('Subgraph ' + d.name);
            labelsSubtreesIDs.push(d.name);
            listStatistics = getStatisticsDataSubtree(d, true);
            notToxicSubtrees.push(listStatistics.toxicity0 + (d.toxicity_level === 0));
            mildlyToxicSubtrees.push(listStatistics.toxicity1 + (d.toxicity_level === 1));
            toxicSubtrees.push(listStatistics.toxicity2 + (d.toxicity_level === 2));
            veryToxicSubtrees.push(listStatistics.toxicity3 + (d.toxicity_level === 3));
        });
    }

    chartSubModalData = {
      labels: labelsSubtrees,
      labelsIDs: labelsSubtreesIDs,
      datasets: [{
        label: 'Not toxic',
        data: notToxicSubtrees,
        backgroundColor: "#F0F0F0",
      },
      {
        label: 'Mildly toxic',
        data: mildlyToxicSubtrees,
        backgroundColor: "#cccccc",
      },
      {
        label: 'Toxic',
        data: toxicSubtrees,
        backgroundColor: "#737373",
      },
      {
        label: 'Very toxic',
        data: veryToxicSubtrees,
        backgroundColor: "#000000",
      }]
    }

    chartModalTitle = 'subgraphs';

    createChartSubModal(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
}

function statisticsStanceSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle = false, minOpacityValue = null, isPopupSelected = null) {

    let children = root.children;
    let listStatistics;
    let labelsSubtrees = [];
    let labelsSubtreesIDs = [];
    let neutralStanceSubtrees = [];
    let positiveStanceSubtrees = [];
    let negativeStanceSubtrees = [];
    let bothStancesSubtrees = [];

    if (children) {
        children.forEach(function (d) {
            if (fromCircle) {
                d = d.data;
            }
            labelsSubtrees.push('Subgraph ' + d.name);
            labelsSubtreesIDs.push(d.name);
            listStatistics = getStatisticsDataSubtree(d, true);
            neutralStanceSubtrees.push(listStatistics.totalNeutralStance + (!d.positive_stance && !d.negative_stance));
            positiveStanceSubtrees.push(listStatistics.totalPositiveStance + d.positive_stance);
            negativeStanceSubtrees.push(listStatistics.totalNegativeStance + d.negative_stance);
            bothStancesSubtrees.push(listStatistics.totalBothStances + (d.negative_stance && d.positive_stance));
        });
    }

    chartSubModalData = {
      labels: labelsSubtrees,
      labelsIDs: labelsSubtreesIDs,
      datasets: [{
        label: 'Neutral',
        data: neutralStanceSubtrees,
        backgroundColor: "#2b2727",
      },
      {
        label: 'Positive',
        data: positiveStanceSubtrees,
        backgroundColor: "#77dd77",
      },
      {
        label: 'Negative',
        data: negativeStanceSubtrees,
        backgroundColor: "#ff6961",
      },
      {
        label: 'Both',
        data: bothStancesSubtrees,
        backgroundColor: "#FFA500",
      }]
    }

    chartModalTitle = 'subgraphs';

    createChartSubModal(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
}

function statisticsTargetSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle = false, minOpacityValue = null, isPopupSelected = null) {

    let children = root.children;
    let listStatistics;
    let labelsSubtrees = [];
    let labelsSubtreesIDs = [];
    let targGroupSubtrees = [];
    let targPersonSubtrees = [];
    let targStereotypeSubtrees = [];
    let targNoneSubtrees = [];

    if (children) {
        children.forEach(function (d) {
            if (fromCircle) {
                d = d.data;
            }
            labelsSubtrees.push('Subgraph ' + d.name);
            labelsSubtreesIDs.push(d.name);
            listStatistics = getStatisticsDataSubtree(d, true);
            targGroupSubtrees.push(listStatistics.totalTargGroup + d.target_group);
            targPersonSubtrees.push(listStatistics.totalTargPerson + d.target_person);
            targStereotypeSubtrees.push(listStatistics.totalTargStereotype + d.stereotype);
            targNoneSubtrees.push(listStatistics.totalTargNone + (!d.target_person && !d.target_group && !d.stereotype));
        });
    }

    chartSubModalData = {
      labels: labelsSubtrees,
      labelsIDs: labelsSubtreesIDs,
      datasets: [{
        label: 'Group',
        data: targGroupSubtrees,
        backgroundColor: "#bf7f81",
      },
      {
        label: 'Person',
        data: targPersonSubtrees,
        backgroundColor: "#606984",
      },
      {
        label: 'Stereotype',
        data: targStereotypeSubtrees,
        backgroundColor: "#798c8f",
      },
      {
        label: 'None',
        data: targNoneSubtrees,
        backgroundColor: "#303133",
      }]
    }

    chartModalTitle = 'subgraphs';

    createChartSubModal(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
}

function statisticsAllFeaturesTree(root, fromCircle = false, isPopupSelected = null) {

    if (fromCircle) {
        root = root.data;
    }

    var listStatistics = getStatisticsDataSubtree(root);

    chartModalData = {
      labels: [''],
      datasets: [{
        label: 'Constructive',
        data: [listStatistics.totalConstructiveness],
        backgroundColor: "#90F6B2",
      },
      {
        label: 'Argument',
        data: [listStatistics.totalArgumentation],
        backgroundColor: "#1B8055",
      },
      {
        label: 'Sarcasm',
        data: [listStatistics.totalSarcasm],
        backgroundColor: "#97CFFF",
      },
      {
        label: 'Mockery',
        data: [listStatistics.totalMockery],
        backgroundColor: "#1795FF",
      },
      {
        label: 'Intolerance',
        data: [listStatistics.totalIntolerance],
        backgroundColor: "#0B5696",
      },
      {
        label: 'Improper',
        data: [listStatistics.totalImproper_language],
        backgroundColor: "#E3B7E8",
      },
      {
        label: 'Insult',
        data: [listStatistics.totalInsult],
        backgroundColor: "#A313B3",
      },
      {
        label: 'Aggressive',
        data: [listStatistics.totalAggressiveness],
        backgroundColor: "#5E1566",
      }]
    }

    chartModalDataPie = {
      labels: ['Constructive', 'Argument', 'Sarcasm', 'Mockery', 'Intolerance', 'Improper', 'Insult', 'Aggressive'],
      datasets: [{
        label: 'total',
        data: [listStatistics.totalConstructiveness, listStatistics.totalArgumentation, listStatistics.totalSarcasm,
                listStatistics.totalMockery, listStatistics.totalIntolerance, listStatistics.totalImproper_language,
                listStatistics.totalInsult, listStatistics.totalAggressiveness],
        backgroundColor: ["#90F6B2", "#1B8055", "#97CFFF", "#1795FF", "#0B5696", "#E3B7E8", "#A313B3", "#5E1566"],
      }]
    }
    chartModalTitle = 'complete_graph';

    createChartModal(isPopupSelected);
}

function statisticsAllFeaturesSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle = false, minOpacityValue = null, isPopupSelected = null) {

    let children = root.children;
    let listStatistics;
    let labelsSubtrees = [];
    let labelsSubtreesIDs = [];
    let constructivenessSubtrees = [];
    let argumentationSubtrees = [];
    let sarcasmSubtrees = [];
    let mockerySubtrees = [];
    let intoleranceSubtrees = [];
    let improperLanguageSubtrees = [];
    let insultSubtrees = [];
    let aggressivenessSubtrees = [];

    if (children) {
        children.forEach(function (d) {
            if (fromCircle) {
                d = d.data;
            }
            labelsSubtrees.push('Subgraph ' + d.name);
            labelsSubtreesIDs.push(d.name);
            listStatistics = getStatisticsDataSubtree(d, true);
            constructivenessSubtrees.push(listStatistics.totalConstructiveness + d.constructiveness);
            argumentationSubtrees.push(listStatistics.totalArgumentation + d.argumentation);
            sarcasmSubtrees.push(listStatistics.totalSarcasm + d.sarcasm );
            mockerySubtrees.push(listStatistics.totalMockery + d.mockery);
            intoleranceSubtrees.push(listStatistics.totalIntolerance + d.intolerance);
            improperLanguageSubtrees.push(listStatistics.totalImproper_language + d.improper_language);
            insultSubtrees.push(listStatistics.totalInsult + d.insult);
            aggressivenessSubtrees.push(listStatistics.totalAggressiveness + d.aggressiveness);
        });
    }

    chartSubModalData = {
      labels: labelsSubtrees,
      labelsIDs: labelsSubtreesIDs,
      datasets: [{
        label: 'Constructive',
        data: constructivenessSubtrees,
        backgroundColor: "#90F6B2",
      },
      {
        label: 'Argument',
        data: argumentationSubtrees,
        backgroundColor: "#1B8055",
      },
      {
        label: 'Sarcasm',
        data: sarcasmSubtrees,
        backgroundColor: "#97CFFF",
      },
      {
        label: 'Mockery',
        data: mockerySubtrees,
        backgroundColor: "#1795FF",
      },
      {
        label: 'Intolerance',
        data: intoleranceSubtrees,
        backgroundColor: "#0B5696",
      },
      {
        label: 'Improper',
        data: improperLanguageSubtrees,
        backgroundColor: "#E3B7E8",
      },
      {
        label: 'Insult',
        data: insultSubtrees,
        backgroundColor: "#A313B3",
      },
      {
        label: 'Aggressive',
        data: aggressivenessSubtrees,
        backgroundColor: "#5E1566",
      }]
    }

    chartModalTitle = 'subgraphs';

    createChartSubModal(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
}

function clickSubtreeChartHandler(static_values_checked, statisticBackground, root, nodes, opacityValue, node, link, nodeName, fromCircle, minOpacityValue) {

    let rootNode;
    if (highlightedSubgraph === nodeName) {
        highlightedSubgraph = null;
        rootNode = root;
    } else {
        highlightedSubgraph = nodeName;
        rootNode = getClickedSubtreeRootNode(root, nodeName, fromCircle);
    }
    let clickedSubtreeNodesPath = [];

    getNodesDescendants(rootNode, clickedSubtreeNodesPath);

    if (!fromCircle) {
        highlightThreadPopup(nodes, root, opacityValue, clickedSubtreeNodesPath, node, link, false, true);
    } else {
        highlightThreadPopupCircle(nodes, root, opacityValue, minOpacityValue, clickedSubtreeNodesPath, node, false, true);
    }

    if (static_values_checked) {
        statisticBackground.html(writeStatisticText(root));
    }
}

function highlightFromPopupNodesIDs (static_values_checked, statisticBackground, root, nodes, nodesIDs, opacityValue, node, link, fromCircle = false, minOpacityValue = null) {

    let nodesPath = [];

    if (fromCircle) {
        nodes.forEach(function (d) {
            if (nodesIDs.includes(d.data.name)) nodesPath.push(d);
        });
    } else {
        nodes.forEach(function (d) {
            if (nodesIDs.includes(d.name)) nodesPath.push(d);
        });
    }
    nodesPath.push(root);

    if (!fromCircle) {
        highlightThreadPopup(nodes, root, opacityValue, nodesPath, node, link, false);
    } else {
        highlightThreadPopupCircle(nodes, root, opacityValue, minOpacityValue, nodesPath, node, false);
    }

    if (static_values_checked) {
        statisticBackground.html(writeStatisticText(root));
    }
}

function statisticsDataChangedTree (root, fromCircle = false, isSubgraphByID = false, isPopupSelected = null) {
    if (!isSubgraphByID) {
        highlightedSubgraph = null;
    }

    if (Chart.getChart('chart-modal-body')) {
        let selectDataValue = document.getElementById('select-chart-data-modal').value;
        if (selectDataValue === 'features') {
            statisticsAllFeaturesTree(root, fromCircle, isPopupSelected);
        } else if (selectDataValue === 'toxicity') {
            statisticsToxicityTree(root, fromCircle, isPopupSelected);
        } else if (selectDataValue === 'stance') {
            statisticsStanceTree(root, fromCircle, isPopupSelected);
        } else if (selectDataValue === 'target') {
            statisticsTargetTree(root, fromCircle, isPopupSelected);
        }
    }
}

function statisticsDataChangedSubtree (root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle = false, minOpacityValue = null, isPopupSelected = null) {

    if (Chart.getChart('chart-sub-modal-body')) {
        let selectDataValue = document.getElementById('select-chart-sub-data-modal').value;
        if (selectDataValue === 'features') {
            statisticsAllFeaturesSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
        } else if (selectDataValue === 'toxicity') {
            statisticsToxicitySubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
        } else if (selectDataValue === 'stance') {
            statisticsStanceSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
        } else if (selectDataValue === 'target') {
            statisticsTargetSubtrees(root, static_values_checked, statisticBackground, nodes, opacityValue, node, link, fromCircle, minOpacityValue, isPopupSelected);
        }
    }
}

function mostTaggedFeatures(root, fromCircle = false) {

    if (fromCircle) {
        root = root.data;
    }
    var listStatistics = getStatisticsDataSubtree(root);

    let dictFeatures = {'Constructive':listStatistics.totalConstructiveness,'Argument':listStatistics.totalArgumentation,
        'Sarcasm':listStatistics.totalSarcasm,'Mockery':listStatistics.totalMockery,'Intolerance':listStatistics.totalIntolerance,
        'Improper language':listStatistics.totalImproper_language,'Insult':listStatistics.totalInsult,'Aggressive':listStatistics.totalAggressiveness}

    // Create items array
    var items = Object.keys(dictFeatures).map(function(key) {
      return [key, dictFeatures[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    items = items.slice(0, 3);

    var textMsg;
    if (items[0][1] === 0) {
        textMsg = "There are no tagged features in the selected nodes";
    } else if (items[1][1] === 0) {
        textMsg = "The most tagged feature is " + items[0][0] + " (" + items[0][1] + "). The other features do not appear even once";
    } else if (items[2][1] === 0){
        textMsg = "The most tagged features are " + items[0][0] + " (" + items[0][1] + ") and " + items[1][0] + " (" + items[1][1] + "). The other features do not appear even once";
    } else {
        textMsg = "The most tagged features are " + items[0][0] + " (" + items[0][1] + "), " + items[1][0] + " (" + items[1][1] + ") and " + items[2][0] + " (" + items[2][1] + ")";
    }
    injectTextConversation(textMsg);
    injectIntentConversation("generate_help_glyphs_message");
}