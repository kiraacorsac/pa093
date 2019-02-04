let svg = {};
let canvasPoints = [];
let polygonPoints = [];
let triangulation = [];


import {triangle} from "./Algorithms/triangulation.js";
import {grahamScan} from "./Algorithms/grahamScan.js";
import {giftWrap} from "./Algorithms/giftWrap.js";
import {kdTree, isHorizontal} from "./Algorithms/kdTree.js";
import {delaunayTriangulate} from "./Algorithms/delaunay.js";
import {voronoi} from "./Algorithms/voronoi.js";

function clear() {
    svg.selectAll("*").remove();
    canvasPoints = [];
}

function drawRandomCircles() {
    const count = 15;

    for (let i = 0; i < count; i++) {
        let x = Math.floor((Math.random() * 900) + 25);
        let y = Math.floor((Math.random() * 900) + 25);
        drawCircle({X: x, Y: y}, 10);
    }
}

function drawCircle(center, size) {
    // console.log('Drawing circle at', x, y, size);
    let tooltip = {};
    let circle = svg.append("circle")
        .attr('class', 'circle')
        .attr("cx", center.X)
        .attr("cy", center.Y)
        .attr("r", size)
        .on('click', function () {
            tooltip.remove();
            canvasPoints = canvasPoints.filter(c => c.X !== Number(d3.select(this).attr("cx")) || c.Y !== Number(d3.select(this).attr("cy")));
            d3.select(this).remove();
            d3.event.stopPropagation();
        }).on('mouseenter', function () {
            tooltip = svg.append("text")
                .attr('x', center.X - 25)
                .attr('y', center.Y + 35)
                .attr('class', 'tooltip')
                .attr('fill', 'red')
                .text(center.X + " " + center.Y);
        }).on('mouseleave', function () {
            tooltip.remove();
            d3.event.stopPropagation();
        });
    //console.log(circle.attr("cx"));
    circle.X = Number(circle.attr("cx"));
    circle.Y = Number(circle.attr("cy"));
    canvasPoints.push(circle);
}

function drawLines(hullLines, color = "black") {
    hullLines.forEach(l => {
        svg.append('line')
            .style("stroke", color)
            .attr('x1', l.s.X)
            .attr('y1', l.s.Y)
            .attr('x2', l.e.X)
            .attr('y2', l.e.Y);
    });
}

function drawKdTree(root) {
    drawKdTreeRecursive(root, {X: 0, Y: 0}, {X: 1000, Y: 1000});
}

function drawKdTreeRecursive(node, start, end) {
    if (node == null) {
        return;
    }

    let line = {};
    if (isHorizontal(node)) {
        line = {s: {X: node.X, Y: start.Y}, e: {X: node.X, Y: end.Y}};
    } else {
        line = {s: {X: start.X, Y: node.Y}, e: {X: end.X, Y: node.Y}};
    }
    drawLines([line], isHorizontal(node) ? "red" : "blue");
    drawKdTreeRecursive(node.left, start, line.e);
    drawKdTreeRecursive(node.right, line.s, end);
}

function drawTriangulation(triangles) {
    for (let triangle of triangles) {
        drawLines([
            {s: triangle.a, e: triangle.b},
            {s: triangle.b, e: triangle.c},
            {s: triangle.c, e: triangle.a}
        ]);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    svg = d3.select('svg');
    canvasPoints = [];


    svg.on('click', function () {
        let coords = d3.mouse(this);
        drawCircle({X: coords[0], Y: coords[1]}, 10);
    });

    document.getElementById("random").onclick = drawRandomCircles;
    document.getElementById("clear").onclick = clear;

    document.getElementById("hull").onclick = () => {
        svg.selectAll("line").remove();
        let lines = [];
        [polygonPoints, lines] = giftWrap(canvasPoints);
        drawLines(lines);
    };

    document.getElementById("graham").onclick = () => {
        svg.selectAll("line").remove();
        let lines = [];
        [polygonPoints, lines] = grahamScan(canvasPoints);
        drawLines(lines);
    };

    document.getElementById("triangle").onclick = () => {
        svg.selectAll("line").remove();
        drawLines(triangle(polygonPoints));
    };

    document.getElementById("kdtree").onclick = () => {
        svg.selectAll("line").remove();
        drawKdTree(kdTree(canvasPoints));
    };

    document.getElementById("delTriangle").onclick = () => {
        svg.selectAll("line").remove();
        triangulation = delaunayTriangulate(canvasPoints);
        drawTriangulation(triangulation);
    };

    document.getElementById("voronoi").onclick = () => {
        svg.selectAll("line").remove();
        drawLines(voronoi(canvasPoints));
    };
});

function getEdge(x1, y1, x2, y2) {
    return {
        s: {X: x1, Y: y1},
        e: {X: x2, Y: y2}
    };
}