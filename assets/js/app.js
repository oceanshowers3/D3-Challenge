// Set default x/y axis variables.
var defaultXAxis = "poverty";
var defaultYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label.
function xScale(data, defaultXAxis, chartWidth) {
    // Create scales.
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[defaultXAxis]) * .8,
            d3.max(data, d => d[defaultXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// Function used for updating xAxis var upon click on axis label.
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Function used for updating y-scale var upon click on axis label.
function yScale(data, defaultYAxis, chartHeight) {
    // Create scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[defaultYAxis]) * .8,
            d3.max(data, d => d[defaultYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// Function used for updating yAxis var upon click on axis label.
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Function used for updating circles group with a transition to new circles.
function renderCircles(circlesGroup, newXScale, newYScale, defaultXAxis, defaultYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[defaultXAxis]))
        .attr("cy", d => newYScale(d[defaultYAxis]));
    return circlesGroup;
}

// Function used for updating text in circles group with a transition to new text.
function renderText(circleTextGroup, newXScale, newYScale, defaultXAxis, defaultYAxis) {
    circleTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[defaultXAxis]))
        .attr("y", d => newYScale(d[defaultYAxis]));
    return circleTextGroup;
}

// Function used for updating circles group with new tooltip.
function updateToolTip(defaultXAxis, defaultYAxis, circlesGroup, textGroup) {
    // Conditional for X Axis.
    if (defaultXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (defaultXAxis === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }
    // Conditional for Y Axis.
    if (defaultYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (defaultYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }
    // Define tooltip.
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (defaultXAxis === "age") {
                // All yAxis tooltip labels presented and formated as %.
                // Display Age without format for xAxis.
                return (`${d.state}<hr>${xlabel} ${d[defaultXAxis]}<br>${ylabel}${d[defaultYAxis]}%`);
                } else if (defaultXAxis !== "poverty" && defaultXAxis !== "age") {
                // Display Income in dollars for xAxis.
                return (`${d.state}<hr>${xlabel}$${d[defaultXAxis]}<br>${ylabel}${d[defaultYAxis]}%`);
                } else {
                // Display Poverty as percentage for xAxis.
                return (`${d.state}<hr>${xlabel}${d[defaultXAxis]}%<br>${ylabel}${d[defaultYAxis]}%`);
                }      
        });
    circlesGroup.call(toolTip);

    // Create "mouseover" event listener to display tool tip.
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}
function makeResponsive() {
    // Select div by id.
    var svgArea = d3.select("#scatter").select("svg");

    // Clear SVG.
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    //SVG params.
    var svgHeight = window.innerHeight/1.2;
    var svgWidth = window.innerWidth/1.7;

    // Margins.
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    };

    // Chart area minus margins.
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assets/data/data.csv").then(function(demoData, err) {
        if (err) throw err;

        // Parse data.
        demoData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });

        // Create x/y linear scales.
        var xLinearScale = xScale(demoData, defaultXAxis, chartWidth);
        var yLinearScale = yScale(demoData, defaultYAxis, chartHeight);

        // Create initial axis functions.
        var bottomAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append x axis.
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // Append y axis.
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Set data used for circles.
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);

        // Bind data.
        var elemEnter = circlesGroup.enter();

        // Create circles.
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[defaultXAxis]))
            .attr("cy", d => yLinearScale(d[defaultYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);

        // Create circle text.
        var circleText = elemEnter.append("text")            
            .attr("x", d => xLinearScale(d[defaultXAxis]))
            .attr("y", d => yLinearScale(d[defaultYAxis]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);

        // Update tool tip function above csv import.
        var circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);

        // Add x label groups and labels.
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Add y labels group and labels.
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

        // X labels event listener.
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label.
                defaultXAxis = d3.select(this).attr("value");

                // Update xLinearScale.
                xLinearScale = xScale(demoData, defaultXAxis, chartWidth);

                // Render xAxis.
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Switch active/inactive labels.
                if (defaultXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (defaultXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                // Update circles with new x values.
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);

                // Update tool tips with new info.
                circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);

                // Update circles text with new values.
                circleText = renderText(circleText, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);
            });

        // Y Labels event listener.
        yLabelsGroup.selectAll("text")
            .on("click", function() {

                // Grab selected label.
                defaultYAxis = d3.select(this).attr("value");

                // Update yLinearScale.
                yLinearScale = yScale(demoData, defaultYAxis, chartHeight);

                // Update yAxis.
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Changes classes to change bold text.
                if (defaultYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (defaultXAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                // Update circles with new y values.
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);

                // Update circles text with new values.
                circleText = renderText(circleText, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);
                
                // Update tool tips with new info.
                circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);
            });
    }).catch(function(err) {
        console.log(err);
    });
}
makeResponsive();
// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);



