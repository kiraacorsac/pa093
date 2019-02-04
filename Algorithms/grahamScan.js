import {computePolarAngle, crossproduct} from "./math.js";

export function grahamScan(points) {
    let hullLines = [];


    let anchor = points.reduce(
        (downmostCircle, currentCircle) => downmostCircle.Y > currentCircle.Y ? downmostCircle : currentCircle
    );

    let sortedCircles = points
        .concat()
        .sort((c1, c2) => computePolarAngle(anchor, c1) < computePolarAngle(anchor, c2) ? 1 : -1);

    let stack = [sortedCircles.shift(), sortedCircles.shift(), sortedCircles.shift()];

    sortedCircles.forEach((circle) => {
        while(crossproduct(stack[stack.length - 2], stack[stack.length - 1], circle) > 0){
            stack.pop()
        }
        stack.push(circle)
    });

    for(let i = 0; i<stack.length-1; i++){
        hullLines.push({s: stack[i], e: stack[i+1]});
    }
    hullLines.push({s: stack[stack.length-1], e: stack[0]});
    // polygonCircles = stack;
    // drawLines(hullLines)
    return [stack, hullLines];

}