export function crossproduct(c1, c2, c3) {
    return (c2.X - c1.X)*(c3.Y-c1.Y) - (c2.Y - c1.Y)*(c3.X-c1.X)
}

export let computePolarAngle = (startPoint, separator) =>  Math.atan2(separator.Y - startPoint.Y, separator.X - startPoint.X);

export function computeRelativeAngle(startPoint, separator, ray) {
    let separatorAngle = computePolarAngle(startPoint, separator);
    let rayAngle = Math.atan2(ray.Y - startPoint.Y, ray.X - startPoint.X);
    return separatorAngle - rayAngle > 0 ? separatorAngle - rayAngle : (separatorAngle - rayAngle) + 2 * Math.PI; // conversion to 0 - 2*PI
}

export let distance = (p1, p2) => Math.sqrt((p1.X - p2.X)**2 + (p1.Y - p2.Y)**2);

export function circleFromPoints(a, b, c) {
    // https://www.qc.edu.hk/math/Advanced%20Level/circle%20given%203%20points.htm
    if (crossproduct(a, b, c) > 0) {
        return null;
    }
    let A = b.X - a.X;
    let B = b.Y - a.Y;
    let C = c.X - a.X;
    let D = c.Y - a.Y;

    let E = A * (a.X + b.X) + B * (a.Y + b.Y);
    let F = C * (a.X + c.X) + D * (a.Y + c.Y);
    let G = 2 * (A * (c.Y - b.Y) - B * (c.X - b.X));

    if (G === 0) {
        return null;
    }

    let centerpoint = {
        X: (D * E - B * F) / G,
        Y: (A * F - C * E) / G
    };
    return {
        center: centerpoint,
        r: Math.sqrt((a.X - centerpoint.X) ** 2 + (a.Y - centerpoint.Y) ** 2)
    };
}
