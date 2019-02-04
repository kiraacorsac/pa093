import {crossproduct, distance} from "./math.js";

function castrate(point) {
    return {X: point.X, Y: point.Y};
}

function en(edge) {
    return JSON.stringify({ s: castrate(edge.s), e: castrate(edge.e)});
}

function de(edge) {
    return JSON.parse(edge);
}

export function delaunayTriangulate(points) {
    let ael = new Set();
    let startingPoint = points[0];
    let secondPoint = getClosestPoint(startingPoint, points.slice(1));
    let startingEdge = {s: startingPoint, e: secondPoint};

    let p = getClosestDelaunayLeftPoint(startingEdge, points);
    if (p == null){
        startingEdge = flip(startingEdge);
        p = getClosestDelaunayLeftPoint(startingEdge, points);
    }

    let secondEdge = {s: startingEdge.e, e: p};
    let thirdEdge = {s: p, e: startingEdge.s};

    ael.add(en(startingEdge));
    ael.add(en(secondEdge));
    ael.add(en(thirdEdge));

    let triangles = [];
    triangles.push({ a: startingPoint, b: secondPoint, c: p });
    while (ael.size !== 0){
        let activeEdge = de(ael.values().next().value);
        let point = getClosestDelaunayLeftPoint(flip(activeEdge), points);
        if(point != null){
            let secondEdge = {s: activeEdge.s, e: point};
            let thirdEdge = {s: point, e: activeEdge.e};

            //if(!ael.delete(en(flip(secondEdge))) && !lines.has(en(secondEdge)) && !lines.has(en(flip(secondEdge)))){
            //if(!ael.has(en(flip(secondEdge))) && !ael.has(en(secondEdge)) && !lines.has(en(secondEdge)) && !lines.has(en(flip(secondEdge)))){
            if(ael.has(en(flip(secondEdge)))){
                ael.delete(en(flip(secondEdge)));
            } else {
                ael.add(en(secondEdge));
            }
            //if(!ael.delete(en(flip(thirdEdge))) && !lines.has(en(thirdEdge)) && !lines.has(en(flip(thirdEdge)))){
            //if(!ael.has(en(flip(thirdEdge))) && !ael.has(en(thirdEdge)) && !lines.has(en(thirdEdge)) && !lines.has(en(flip(thirdEdge)))){
            if(ael.has(en(flip(thirdEdge)))){
                ael.delete(en(flip(thirdEdge)));
            } else {
                ael.add(en(thirdEdge));
            }
            triangles.push({a: activeEdge.s, b: point, c: activeEdge.e});
        }
        ael.delete(en(activeEdge));

    }
    return triangles;
}

function getClosestPoint(point, points) {
    let minDistance = distance(point, points[0]);
    let result = points[0];

    for (let consideredPoint of points){
        let consideredDistance = distance(point, consideredPoint);
        if(consideredDistance < minDistance){
            minDistance = consideredDistance;
            result = consideredPoint;
        }
    }
    return result;
}

function getClosestDelaunayLeftPoint(edge, points){
    let minDistance = Number.POSITIVE_INFINITY;
    let result = null;

    for (let consideredPoint of points){
        let consideredDistance = getDelaunayDistance(edge.s, edge.e, consideredPoint);
        if(consideredDistance < minDistance){
            minDistance = consideredDistance;
            result = consideredPoint;
        }
    }
    return result;
}

function getDelaunayDistance(p1, p2, p3) {
    if (crossproduct(p1, p2, p3) >= 0){
        return Number.POSITIVE_INFINITY;
    }

    let center = circumCircle(p1, p2, p3);
    let r = distance(center, p1);

    if (crossproduct(p1, p2, p3) <= 0 && crossproduct(p1, p2, center) <= 0){
        return r;
    } else {
        return -1*r;
    }

}

function circumCircle(p1, p2, p3) {
    let cp = crossproduct(p1, p2, p3);
    if (cp !== 0){
        let p1sq = squarePoint(p1);
        let p2sq = squarePoint(p2);
        let p3sq = squarePoint(p3);
        let numY = p1sq * (p2.Y - p3.Y) + p2sq * (p3.Y - p1.Y) + p3sq * (p1.Y - p2.Y);
        let cx = numY / (2.0 * cp);
        let numX = p1sq * (p3.X - p2.X) + p2sq * (p1.X - p3.X) + p3sq * (p2.X - p1.X);
        let cy = numX / (2.0 * cp);
        return {X: cx, Y: cy};
    }
    return null;
}

function squarePoint(p) {
    return p.X**2 + p.Y**2;
}

function flip(edge) {
    return {s: edge.e, e: edge.s};
}