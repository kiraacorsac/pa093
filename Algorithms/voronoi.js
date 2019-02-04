import {FastPriorityQueue} from "../libs/priorityq/priority-queue.js";
import {RedBlackNode} from "../libs/rbtrees/RedBlackNode.js";
import {RedBlackTree} from "../libs/rbtrees/RedBlackTree.js";
import {circleFromPoints} from "./math.js";

//http://blog.ivank.net/fortunes-algorithm-and-implementation.html
//https://jacquesh.github.io/post/fortunes-algorithm/
//http://old.cescg.org/CESCG99/RCuk/index.html
//https://www.cs.hmc.edu/~mbrubeck/voronoi.html
//https://github.com/gorhill/Javascript-Voronoi


let comparator = (a, b) => a.X === b.X ? a.Y < b.Y : a.X < b.X;
let siteEvents = FastPriorityQueue(comparator);
let circleEvents = FastPriorityQueue(comparator);
let parabolicFront = {root: null};
let edges = [];

export function voronoi(points) {
    siteEvents = FastPriorityQueue(comparator);
    circleEvents = FastPriorityQueue(comparator);
    parabolicFront = {root: null};
    edges = [];
    siteEvents.heapify(points.concat());

    while (!siteEvents.empty()) {
        if (!circleEvents.empty() && comparator(circleEvents.peek(), siteEvents.peek())) {
            circleEventHandler();
        } else {
            siteEventHandler();
        }
    }

    while (!circleEvents.empty()) {
        circleEventHandler();
    }
    finishRemainingEdges();

    return edges;


}

function insertParabola(beforeParabola, parabolaPoint) {
    beforeParabola.next.prev = {
        point: parabolaPoint,
        prev: beforeParabola,
        next: beforeParabola.next
    };
    beforeParabola.next = beforeParabola.next.prev;
    return beforeParabola.next;;
}

function siteEventHandler() {
    let currentPoint = siteEvents.poll();
    if (parabolicFront.root == null) {
        parabolicFront.root = {
            point: currentPoint,
            prev: null,
            next: null
        };
        return;
    }

    let parabola = parabolicFront.root;
    let prev_parabola = parabola;

    while (parabola != null) {
        let intersection = intersects(currentPoint, parabola);
        if (intersection != null) {
            if (parabola.next != null && intersects(currentPoint, parabola.next) == null) { //TODO redblacktrees
                parabola.next.prev = {
                    point: parabola.point,
                    prev: parabola,
                    next: parabola.next
                };
                parabola.next = parabola.next.prev;
            } else {
                parabola.next = {
                    point: parabola.point,
                    prev: parabola,
                    next: null
                }
            }
            parabola.next.s1 = parabola.s1;

            //insert currentPoint parabola
            parabola = insertParabola(parabola, currentPoint);


            let intersectionSegment = {
                s: intersection
            };
            edges.push(intersectionSegment);

            parabola.prev.s1 = intersectionSegment;
            parabola.s0 = intersectionSegment;

            let intersectionSegment2 = {
                s: intersection
            };
            edges.push(intersectionSegment2);

            parabola.next.s0 = intersectionSegment2;
            parabola.s1 = intersectionSegment2;

            checkCicleEvent(parabola, currentPoint.X);
            checkCicleEvent(parabola.prev, currentPoint.X);
            checkCicleEvent(parabola.next, currentPoint.X);

            return;
        }

        prev_parabola = parabola;
        parabola = parabola.next;
    }

    prev_parabola.next = {
        point: currentPoint,
        prev: prev_parabola
    };

    let interSegment = {
        s: {
            X: 0,
            Y: (currentPoint.Y + prev_parabola.point.Y) / 2
        }
    };
    edges.push(interSegment);
    prev_parabola.s1 = interSegment;
    prev_parabola.next.s0 = interSegment;


}

function checkCicleEvent(parabola, currentX) {
    if (parabola.event != null && parabola.event.X !== currentX) {
        parabola.event.falseAlarm = true;
    }
    parabola.event = null;

    if (parabola.prev == null || parabola.next == null) {
        return;
    }

    let circle = circleFromPoints(parabola.prev.point, parabola.point, parabola.next.point);
    if (circle != null && circle.center.X + circle.r > currentX) {
        parabola.event = {
            X: circle.center.X + circle.r,
            point: circle.center,
            parabola: parabola,
        };

        circleEvents.add(parabola.event);
    }
}

function circleEventHandler() {
    let circleEvent = circleEvents.poll();
    if (!circleEvent.falseAlarm) {
        let edge = {s: circleEvent.point};
        edges.push(edge);


        let parabola = circleEvent.parabola;

        if (parabola.prev != null) {
            parabola.prev.next = parabola.next;
            parabola.prev.s1 = edge;
        }
        if (parabola.next != null) {
            parabola.next.prev = parabola.prev;
            parabola.next.s0 = edge;
        }

        if (parabola.s0 != null) {
            finishEdge(parabola.s0, circleEvent.point);
        }
        if (parabola.s1 != null) {
            finishEdge(parabola.s1, circleEvent.point);
        }

        if (parabola.prev != null) {
            checkCicleEvent(parabola.prev, circleEvent.X);
        }
        if (parabola.next != null) {
            checkCicleEvent(parabola.next, circleEvent.X);
        }
    }
}

function finishEdge(edge, point) {
    if (edge.e == null) {
        edge.e = point;
    }
}

function finishRemainingEdges() {
    let parabola = parabolicFront.root;
    while(parabola.next != null){
        if (parabola.s1 != null){
            finishEdge(parabola.s1, parabolasIntersects(parabola.point, parabola.next.point, 5000));
        }
        parabola = parabola.next;
    }
}

function intersects(newParabolaPoint, parabola) {
    if (newParabolaPoint.X === parabola.point.X) {
        return null;
    }

    let neighbour = true;

    if (parabola.prev != null) {
        neighbour = parabolasIntersects(parabola.prev.point, parabola.point, newParabolaPoint.X).Y <= newParabolaPoint.Y;
    }
    if (parabola.next != null) {
        neighbour = neighbour && parabolasIntersects(parabola.point, parabola.next.point, newParabolaPoint.X).Y >= newParabolaPoint.Y;
    }

    if (neighbour) {
        return {
            X: (parabola.point.X ** 2 + (parabola.point.Y - newParabolaPoint.Y) ** 2 - newParabolaPoint.X ** 2) / (2 * parabola.point.X - 2 * newParabolaPoint.X),
            Y: newParabolaPoint.Y,
        }
    }
    return null;
}

//Black magic section
function parabolasIntersects(p0, p1, sweepline) {
    let intersectonPoint = {};
    let chosenP = {};
    if (p0.X === p1.X) {
        intersectonPoint.Y = (p0.Y + p1.Y) / 2;
        chosenP = p0;
    } else if (p1.X === sweepline) {
        intersectonPoint.Y = p1.Y;
        chosenP = p0;
    } else if (p0.X === sweepline) {
        intersectonPoint.Y = p0.Y;
        chosenP = p1;
    } else {
        //I have no idea how this works.
        chosenP = p0;
        let z0 = 2 * (p0.X - sweepline);
        let z1 = 2 * (p1.X - sweepline);

        let a = 1 / z0 - 1 / z1;
        let b = -2 * (p0.Y / z0 - p1.Y / z1);
        let c = (p0.Y ** 2 + p0.X ** 2 - sweepline ** 2) / z0 - (p1.Y ** 2 + p1.X ** 2 - sweepline ** 2) / z1;

        intersectonPoint.Y = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
    }

    intersectonPoint.X = (chosenP.X ** 2 + (chosenP.Y - intersectonPoint.Y) ** 2 - sweepline ** 2) / (2 * chosenP.X - 2 * sweepline);
    return intersectonPoint;
}




