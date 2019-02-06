import {crossproduct} from "./math.js"

function lexicoComparsion(c1, c2) {
    let yDiff = c1.Y - c2.Y;
    let xDiff = c1.X - c2.X;

    return yDiff === 0 ? xDiff : yDiff;
}

export function triangle(polygon) {
    let topIndex = 0;
    let bottomIndex = 0;
    for(let i = 0; i < polygon.length; i++) {
        if (polygon[i].Y > polygon[topIndex].Y) {
            topIndex = i;
        }
        if (polygon[i].Y < polygon[bottomIndex].Y) {
            bottomIndex = i;
        }
    }

    let sooner;
    let later;
    [sooner, later] = topIndex < bottomIndex ? [topIndex, bottomIndex] : [bottomIndex, topIndex];


    for(let i = sooner; i<=later; i++){
        polygon[i].path = "LEFT";
    }

    for(let i = later; i < polygon.length; i++){
        polygon[i].path = "RIGHT";
    }
    for(let i = 0; i <= sooner; i++){
        polygon[i].path = "RIGHT";
    }

    console.log(polygon);

    let peek = (s) => s[s.length -1];
    let canAdd = (query, previous, sweepPoint) => {
        let area = crossproduct(sweepPoint, query, previous);
        if(sweepPoint.path === "LEFT"){
            return crossproduct(sweepPoint, {x: sweepPoint.X + 1, y: sweepPoint.Y}, previous) > 0 !== area > 0;
        } else {
            return crossproduct(sweepPoint, {x: sweepPoint.X - 1, y: sweepPoint.Y}, previous) > 0 !== area > 0;
        }
    };

    let sortedPoints = polygon.concat().sort(lexicoComparsion);
    sortedPoints[0].path = "END";
    peek(sortedPoints).path = "END";

    let stack = [sortedPoints[0], sortedPoints[1]];

    let triangleLines = [{s: sortedPoints[0], e:sortedPoints[1]}];
    for (let i = 2; i < sortedPoints.length; i++){
        if(sortedPoints[i].path === peek(stack).path){
            //make edges from sortedPoints[i] down, unitl able (last k)
            //pop until k
            triangleLines.push({s:peek(stack), e: sortedPoints[i]});
            let previous = stack.pop();
            while(peek(stack) && canAdd(peek(stack), previous, sortedPoints[i])){
                triangleLines.push({s:previous, e: sortedPoints[i]});
                previous = stack.pop();
            }
            stack.push(previous);
            stack.push(sortedPoints[i]);
        } else
        {
            let top = peek(stack);
            while(peek(stack)){
                triangleLines.push({s:stack.pop(), e: sortedPoints[i]});
            }
            stack.push(top);
            stack.push(sortedPoints[i]);
        }
    }

    //svg.selectAll("line").remove();
    //drawLines(triangleLines);
    return triangleLines;
}