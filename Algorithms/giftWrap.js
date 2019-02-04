import {computeRelativeAngle} from "./math.js";

export function giftWrap(points) {
    let hullLines = [];
    let polygonCircles = [];

    let firstPoint = points.reduce(
        (rightmostCircle, currentCircle) =>  rightmostCircle.X > currentCircle.X ? rightmostCircle : currentCircle
    );
    let begin = firstPoint;
    let separator = {X: begin.X, Y: begin.Y + 1};
    let previous = begin;
    //polygonCircles.push(begin);
    do {
        previous = begin;

        begin = points
            .filter(c => c !== begin)
            .map(c => ({angle: computeRelativeAngle(begin, separator, c), point: c}))
            .reduce((minimalPoint, currentPoint) => currentPoint.angle < minimalPoint.angle ? currentPoint : minimalPoint)
            .point;
        separator = previous;
        polygonCircles.push(begin);
        hullLines.push({s: previous, e: begin});

    } while(begin !== firstPoint);

    return [polygonCircles, hullLines]
}