// Load data from CSV file
d3.csv("loan_new.csv").then(function(data) {
    // Log data to ensure it's loaded properly
    console.log(data); // Check if data is properly loaded in the console
    
    // Convert necessary fields to numbers
    data.forEach(d => {
        d.CurrentLoanAmount = +d.CurrentLoanAmount;
        d.CreditScore = +d.CreditScore;
        d.AnnualIncome = +d.AnnualIncome;
    });

    // Select the chart container
    const svg = d3.select("#chartSvg");
    const width = svg.attr("width");
    const height = svg.attr("height");

    // Set up scales for Scatter Plot with some padding
    const scatterX = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AnnualIncome) * 1.1]) // Add 10% padding for better visibility
        .range([50, width - 50]);

    const scatterY = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.CurrentLoanAmount) * 1.1]) // Add 10% padding for better visibility
        .range([height - 50, 50]);

    // Update function to handle chart rendering
    function updateChart(chartType) {
        svg.selectAll("*").remove(); // Clear previous chart content

        if (chartType === "barChart") {
            // Bar Chart: Number of Loans by Loan Status
            const loanStatusCounts = d3.rollups(data, v => v.length, d => d['Loan Status']);

            const x = d3.scaleBand()
                .domain(loanStatusCounts.map(d => d[0]))
                .range([50, width - 50])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(loanStatusCounts, d => d[1])])
                .range([height - 50, 50]);

            svg.selectAll("rect")
                .data(loanStatusCounts)
                .enter()
                .append("rect")
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d[1]))
                .attr("width", x.bandwidth())
                .attr("height", d => height - 50 - y(d[1]))
                .attr("fill", "#007bff");

            svg.append("g")
                .attr("transform", `translate(0, ${height - 50})`)
                .call(d3.axisBottom(x));

            svg.append("g")
                .attr("transform", "translate(50, 0)")
                .call(d3.axisLeft(y));

        } else if (chartType === "pieChart") {
            // Pie Chart: Distribution of Home Ownership
            const homeOwnershipCounts = d3.rollups(data, v => v.length, d => d['Home Ownership']);
            const pie = d3.pie().value(d => d[1])(homeOwnershipCounts);
            const arc = d3.arc().innerRadius(0).outerRadius(200);

            const color = d3.scaleOrdinal()
                .domain(homeOwnershipCounts.map(d => d[0]))
                .range(d3.schemeCategory10);

            const group = svg.append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);

            group.selectAll("path")
                .data(pie)
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("fill", d => color(d.data[0]));

            // Add Labels with Percentages
            group.selectAll("text")
                .data(pie)
                .enter()
                .append("text")
                .attr("transform", function(d) { 
                    return "translate(" + arc.centroid(d) + ")"; 
                })
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("fill", "white")
                .text(function(d) {
                    const percentage = (d.data[1] / d3.sum(homeOwnershipCounts, d => d[1]) * 100).toFixed(1);
                    return `${d.data[0]} (${percentage}%)`;
                });

        } else if (chartType === "histogram") {
            // Histogram: Credit Score Distribution
            const creditScores = data.map(d => d.CreditScore);
            const histogram = d3.histogram()
                .domain([0, d3.max(creditScores) * 1.1]) // Add 10% padding for better visibility
                .thresholds(15); // Increase number of bins for better distribution

            const bins = histogram(creditScores);
            const x = d3.scaleLinear()
                .domain([0, d3.max(creditScores) * 1.1])
                .range([50, width - 50]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)])
                .range([height - 50, 50]);

            svg.selectAll("rect")
                .data(bins)
                .enter()
                .append("rect")
                .attr("x", d => x(d.x0))
                .attr("y", d => y(d.length))
                .attr("width", d => x(d.x1) - x(d.x0) - 1)
                .attr("height", d => height - 50 - y(d.length))
                .attr("fill", "orange");

            svg.append("g")
                .attr("transform", `translate(0, ${height - 50})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append("g")
                .attr("transform", "translate(50, 0)")
                .call(d3.axisLeft(y));

        } else if (chartType === "scatterPlot") {
            // Scatter Plot: Annual Income vs Current Loan Amount
            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => scatterX(d.AnnualIncome))
                .attr("cy", d => scatterY(d.CurrentLoanAmount))
                .attr("r", 5)
                .attr("fill", "green")
                .attr("opacity", 0.7); // Add some opacity for overlapping points

            svg.append("g")
                .attr("transform", `translate(0, ${height - 50})`)
                .call(d3.axisBottom(scatterX).ticks(10));

            svg.append("g")
                .attr("transform", "translate(50, 0)")
                .call(d3.axisLeft(scatterY).ticks(10));
        }
    }

    // Initial chart render
    updateChart("barChart");

    // Dropdown change event listener
    d3.select("#chartType").on("change", function() {
        const selectedChart = d3.select(this).property("value");
        updateChart(selectedChart);
    });
});
