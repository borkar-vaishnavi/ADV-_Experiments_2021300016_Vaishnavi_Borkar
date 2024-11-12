import * as d3 from "d3";

// Load the CSV data
d3.csv("data.csv").then(dataset => {
    dataset.forEach(d => {
        d.Elevation = +d.Elevation;
        d.Aspect = +d.Aspect;
        d.Slope = +d.Slope;
        d.Horizontal_ = +d.Horizontal_;
        d.Vertical_Dis = +d.Vertical_Dis;
        d.Hillshade_9 = +d.Hillshade_9;
        d.Hillshade_N = +d.Hillshade_N;
        d.Hillshade_3 = +d.Hillshade_3;
        d.Horizontal_1 = +d.Horizontal_1;
    });

    // Bar Chart
    const barChartWidth = 500, barChartHeight = 300;
    const barSvg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", barChartWidth)
        .attr("height", barChartHeight);

    barSvg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 30)
        .attr("y", d => barChartHeight - d.Elevation / 10)
        .attr("width", 25)
        .attr("height", d => d.Elevation / 10)
        .attr("fill", "steelblue");

    // Pie Chart
    const pieSvg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", 300)
        .attr("height", 300)
        .append("g")
        .attr("transform", "translate(150,150)");

    const pie = d3.pie().value(d => d.Slope);
    const pieData = pie(dataset);

    const arc = d3.arc().innerRadius(0).outerRadius(100);

    pieSvg.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => d3.schemeTableau10[i % 10]);

    // Histogram
    const histogramWidth = 500, histogramHeight = 300;
    const histogramSvg = d3.select("#histogram")
        .append("svg")
        .attr("width", histogramWidth)
        .attr("height", histogramHeight);

    const x = d3.scaleLinear().domain([0, d3.max(dataset, d => d.Slope)]).range([0, histogramWidth]);
    const histogram = d3.histogram().value(d => d.Slope).thresholds(x.ticks(10));
    const bins = histogram(dataset);

    const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).range([histogramHeight, 0]);

    histogramSvg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => histogramHeight - y(d.length))
        .attr("fill", "orange");

    // Scatter Plot
    const scatterWidth = 500, scatterHeight = 300;
    const scatterSvg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", scatterWidth)
        .attr("height", scatterHeight);

    scatterSvg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.Horizontal_))
        .attr("cy", d => y(d.Vertical_Dis))
        .attr("r", 5)
        .attr("fill", "purple");

    // Box Plot - Simplified as D3 doesn't have a built-in box plot generator
    const boxPlotWidth = 500, boxPlotHeight = 100;
    const boxPlotSvg = d3.select("#box-plot")
        .append("svg")
        .attr("width", boxPlotWidth)
        .attr("height", boxPlotHeight);

    const aspects = dataset.map(d => d.Aspect);
    const aspectScale = d3.scaleLinear().domain([0, d3.max(aspects)]).range([0, boxPlotWidth]);

    boxPlotSvg.append("line")
        .attr("x1", aspectScale(d3.min(aspects)))
        .attr("x2", aspectScale(d3.max(aspects)))
        .attr("y1", boxPlotHeight / 2)
        .attr("y2", boxPlotHeight / 2)
        .attr("stroke", "black");

    // Add more box plot details here, such as median, quartiles, etc.
});
