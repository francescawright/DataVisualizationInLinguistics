let svg = d3.select("#svg_treeMap"),
    diameter = svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(2,2)"),
    format = d3.format(",d");

let pack = d3.pack()
    .size([diameter - 2, diameter - 2])
    .padding(3);


var colourToxicity0 = "#FAFFA8", colourToxicity1 = "#F8BB7C", colourToxicity2 = "#F87A54",
    colourToxicity3 = "#7A1616", colourNewsArticle = "#E3E1C5";


// shadow filter //
var defs = svg.append("defs");

var filter = defs.append("filter")
    .attr("id", "dropshadow")

filter.append("feDropShadow")
    .attr("flood-opacity", 1)
    .attr("dx", 0)
    .attr("dy", 1)
//


treeJSON = d3.json(dataset, function (error, root) {
//d3.json("https://ecemkavaz.github.io/jsonData/fakeDataCircle2.json", function(error, root) {
    if (error) throw error;


    root = d3.hierarchy(root)
        .sum(function (d) {
            console.log(d);
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

    const node = g.selectAll(".node")
        .data(pack(root).descendants())
        .enter().append("g")
        .attr("class", function (d) {
            return d.children ? "node" : "leaf node";
        })
        .attr("transform", function (d) {
            console.log(d.data.name, d.x, d.y);
            return "translate(" + d.x + "," + d.y + ")";
        })


    //node.append("title")
    //  .text(function(d) { return d.data.name + "\n" + format(d.value); });
    //
    node.append("circle")
        .attr("r", function (d) {
            var rootSize = 1000;
            console.log(d);
            console.log(d.children);
            if (d.depth === 0) {
                return rootSize;
            }
            console.log(d.depth, d.parent.children.length);
            switch (d.depth) {
                case 1:
                    return rootSize / d.parent.children.length * 2;
                case 2:
                    return (rootSize / d.parent.children.length) / d.parent.parent.children.length * 2;
                case 3:
                    return ((rootSize / d.parent.children.length) / d.parent.parent.children.length) / d.parent.parent.parent.children.length * 2;
                // case 4:
                //     return (((rootSize / d.parent.children.length) / d.parent.parent.children.length) / d.parent.parent.parent.children.length) / d.parent.parent.parent.parent.children.length * 2;
                default:
                    return 25;
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

