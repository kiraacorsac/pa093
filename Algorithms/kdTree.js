export function kdTree(points){
    return kdTreeRecursive(points, 0);
}

export let isHorizontal = (node) => node.depth % 2 === 0;

function kdTreeRecursive(points, depth) {
    if (points.length === 0){
        return null;
    }
    let horizontal = depth % 2 === 0;
    let comparator = horizontal ? (a, b) => a.X - b.X : (a, b) => a.Y - b.Y;
    points.sort(comparator);

    let median = Math.floor(points.length/2);
    let leftPoints = points.slice(0, median);
    let rightPoints = points.slice(median+1);

    let left = kdTreeRecursive(leftPoints, depth + 1);
    let right = kdTreeRecursive(rightPoints, depth + 1);

    return {point: points[median], left: left, right: right, depth: depth, X: points[median].X, Y: points[median].Y };
}