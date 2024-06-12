export { drawCircularDiagram, drawCurveDiagram };

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

const drawCurveDiagram = (data) => {
    const svgWidth = 250;
    const svgHeight = 60;
    const chartHeight = 40; // height available for the chart within the SVG
    const padding = 10; // padding around the chart
    const maxGrade = Math.max(...data.map(d => d.grade));
    const minGrade = Math.min(...data.map(d => d.grade));

    // Calculate the points for the variation curve
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (svgWidth - 2 * padding) + padding;
        const y = (1 - (d.grade - minGrade) / (maxGrade - minGrade)) * chartHeight + padding;
        return { x, y, grade: d.grade, captainLogin: d.group.captainLogin };
    });

    // Function to generate a smooth curve using Bezier curves
    function generateCurvePath(points) {
        if (points.length < 2) return '';
        let path = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            path += ` Q${points[i].x},${points[i].y} ${xc},${yc}`;
        }
        path += ` T${points[points.length - 1].x},${points[points.length - 1].y}`;
        return path;
    }

    // Update the variation curve path
    const variationCurve = document.getElementById('variation-curve');
    variationCurve.setAttribute('d', generateCurvePath(points));

    // Create hover points
    const hoverPointsGroup = document.getElementById('hover-points');
    const hoverGroupText = document.getElementById('hover-group-text');
    const hoverCaptainText = document.getElementById('hover-captain-text');
    const hoverGradeText = document.getElementById('hover-grade-text');
    const hoverBullet = document.getElementById('hover-bullet');

    points.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', 5);
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('stroke', 'transparent');
        circle.setAttribute('data-captain', point.captainLogin);
        circle.setAttribute('data-grade', point.grade);

        circle.addEventListener('mouseover', function() {
            hoverGroupText.setAttribute('x', point.x);
            hoverGroupText.setAttribute('y', point.y - 25); // Display above the curve
            hoverGroupText.textContent = 'Group of:';
            hoverGroupText.setAttribute('visibility', 'visible');

            hoverCaptainText.setAttribute('x', point.x);
            hoverCaptainText.setAttribute('y', point.y - 10); // Display just below the "Group of:" text
            hoverCaptainText.textContent = point.captainLogin;
            hoverCaptainText.setAttribute('visibility', 'visible');

            hoverGradeText.setAttribute('x', point.x);
            hoverGradeText.setAttribute('y', point.y + 15); // Display below the curve
            hoverGradeText.textContent = `${point.grade.toFixed(2)}`;
            hoverGradeText.setAttribute('visibility', 'visible');

            // Show hover bullet
            hoverBullet.setAttribute('cx', point.x);
            hoverBullet.setAttribute('cy', point.y);
            hoverBullet.setAttribute('visibility', 'visible');
        });

        circle.addEventListener('mouseout', function() {
            hoverGroupText.setAttribute('visibility', 'hidden');
            hoverCaptainText.setAttribute('visibility', 'hidden');
            hoverGradeText.setAttribute('visibility', 'hidden');

            // Hide hover bullet
            hoverBullet.setAttribute('visibility', 'hidden');
        });

        hoverPointsGroup.appendChild(circle);
    });
}
