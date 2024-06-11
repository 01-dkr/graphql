export { drawCircularDiagram };

const drawCircularDiagram = (values) => {
    const projectsDone = values[0];
    const projectsInProgress = values[1];
    const total = projectsDone + projectsInProgress;
    const doneAngle = (projectsDone / total) * 360;
    const inProgressAngle = (projectsInProgress / total) * 360;

    // Function to describe an arc
    const describeArc = (cx, cy, r, startAngle, endAngle) => {
        const start = polarToCartesian(cx, cy, r, endAngle);
        const end = polarToCartesian(cx, cy, r, startAngle);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", start.x, start.y,
            "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
            "L", cx, cy,
            "Z"
        ].join(" ");
    }

    // Function to convert polar coordinates to cartesian
    const polarToCartesian = (cx, cy, r, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: cx + (r * Math.cos(angleInRadians)),
            y: cy + (r * Math.sin(angleInRadians))
        };
    }

    // Update SVG paths
    document.getElementById("done-segment").setAttribute("d", describeArc(125, 125, 100, 0, doneAngle));
    document.getElementById("in-progress-segment").setAttribute("d", describeArc(125, 125, 100, doneAngle, doneAngle + inProgressAngle));
}
