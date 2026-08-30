/* =========================================================
   PEOPLE SIGNAL
   Main JavaScript
========================================================= */

"use strict";


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenu = $("#mobileMenu");
const navLinks = $(".nav-links");

if (mobileMenu) {

    mobileMenu.addEventListener("click", () => {

        navLinks.classList.toggle("mobile-open");

        const icon = mobileMenu.querySelector("i");

        if (navLinks.classList.contains("mobile-open")) {

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });

}


$$(".nav-link").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("mobile-open");

        const icon = mobileMenu?.querySelector("i");

        if (icon) {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });

});


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

const sections = $$("section[id]");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {
            current = section.id;
        }

    });

    $$(".nav-link").forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") === `#${current}`
        ) {

            link.classList.add("active");

        }

    });

});


/* =========================================================
   DARK MODE
========================================================= */

const themeToggle = $("#themeToggle");

const savedTheme =
    localStorage.getItem("peopleSignalTheme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

}

function updateThemeIcon() {

    if (!themeToggle) return;

    const icon = themeToggle.querySelector("i");

    if (document.body.classList.contains("dark")) {

        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");

    } else {

        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");

    }

}

updateThemeIcon();


if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "peopleSignalTheme",
            isDark ? "dark" : "light"
        );

        updateThemeIcon();

    });

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message, type = "success") {

    const toast = $("#toast");
    const toastMessage = $("#toastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    const icon = toast.querySelector("i");

    if (type === "error") {

        icon.className = "fa-solid fa-circle-exclamation";

    } else {

        icon.className = "fa-solid fa-circle-check";

    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================================
   SCROLL TOP
========================================================= */

const scrollTop = $("#scrollTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {

        scrollTop?.classList.add("show");

    } else {

        scrollTop?.classList.remove("show");

    }

});


if (scrollTop) {

    scrollTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   PREDICTION FORM
========================================================= */

const predictionForm = $("#predictionForm");

const predictButton = $("#predictButton");

const predictText = $("#predictText");

const predictLoader = $("#predictLoader");

const resetButton = $("#resetButton");

const resultPanel = $("#resultPanel");

const resultEmpty = $("#resultEmpty");

const resultContent = $("#resultContent");

const resultRisk = $("#resultRisk");

const resultConfidence = $("#resultConfidence");

const resultCircle = $("#resultCircle");

const resultDescription = $("#resultDescription");

const recommendationText = $("#recommendationText");

const resultReset = $("#resultReset");


/* =========================================================
   NUMBER FIELDS
========================================================= */

const numericFields = [

    "Age",
    "Education",
    "JobLevel",
    "DailyRate",
    "DistanceFromHome",
    "MonthlyIncome",
    "TotalWorkingYears",
    "YearsAtCompany",
    "YearsInCurrentRole",
    "YearsSinceLastPromotion",
    "YearsWithCurrManager",
    "NumCompaniesWorked",
    "TrainingTimesLastYear",
    "PercentSalaryHike",
    "EnvironmentSatisfaction",
    "JobInvolvement",
    "JobSatisfaction",
    "RelationshipSatisfaction",
    "WorkLifeBalance",
    "PerformanceRating",
    "StockOptionLevel"

];


/* =========================================================
   FORM DATA
========================================================= */

function collectFormData() {

    const formData = new FormData(predictionForm);

    const data = {};

    formData.forEach((value, key) => {

        if (numericFields.includes(key)) {

            data[key] =
                value === "" ? null : Number(value);

        } else {

            data[key] = value;

        }

    });

    /*
        These columns are required by the trained model
        but are not exposed in the user form.
    */

    data.EmployeeCount = 1;
    data.EmployeeNumber = 0;
    data.Over18 = "Y";
    data.StandardHours = 80;

    return data;

}


/* =========================================================
   PREDICTION
========================================================= */

if (predictionForm) {

    predictionForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            if (!predictionForm.checkValidity()) {

                predictionForm.reportValidity();

                showToast(
                    "Please complete all required fields.",
                    "error"
                );

                return;

            }

            const data = collectFormData();

            setPredictionLoading(true);

            try {

                const response = await fetch(
                    "/api/predict",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {

                    throw new Error(
                        result.error ||
                        "Prediction failed."
                    );

                }

                showPredictionResult(result);

                showToast(
                    "Prediction completed successfully."
                );

            } catch (error) {

                console.error(error);

                showToast(
                    error.message ||
                    "Unable to connect to prediction server.",
                    "error"
                );

            } finally {

                setPredictionLoading(false);

            }

        }
    );

}


/* =========================================================
   LOADING STATE
========================================================= */

function setPredictionLoading(loading) {

    if (!predictButton) return;

    predictButton.disabled = loading;

    if (loading) {

        predictText?.classList.add("hidden");

        predictLoader?.classList.remove("hidden");

    } else {

        predictText?.classList.remove("hidden");

        predictLoader?.classList.add("hidden");

    }

}


/* =========================================================
   SHOW RESULT
========================================================= */

function showPredictionResult(result) {

    resultEmpty?.classList.add("hidden");

    resultContent?.classList.remove("hidden");

    const confidence =
        Number(result.confidence || 0);

    resultConfidence.textContent =
        Math.round(confidence);

    resultRisk.textContent =
        result.risk || "Unknown";

    recommendationText.textContent =
        result.recommendation ||
        "Review the employee factors.";

    if (result.risk_level === "high") {

        resultRisk.classList.add("high");

        resultDescription.textContent =
            "The employee profile shows indicators associated with higher attrition risk.";

        resultCircle.style.borderColor =
            "#b8643a";

    } else {

        resultRisk.classList.remove("high");

        resultDescription.textContent =
            "Current employee factors indicate relatively low attrition risk.";

        resultCircle.style.borderColor =
            "#3b7564";

    }

    /*
        Animate confidence
    */

    animateNumber(
        resultConfidence,
        0,
        Math.round(confidence),
        700
    );

}


/* =========================================================
   NUMBER ANIMATION
========================================================= */

function animateNumber(
    element,
    start,
    end,
    duration
) {

    if (!element) return;

    const startTime = performance.now();

    function update(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(elapsed / duration, 1);

        const eased =
            1 - Math.pow(1 - progress, 3);

        const value =
            Math.round(
                start +
                (end - start) * eased
            );

        element.textContent = value;

        if (progress < 1) {

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}


/* =========================================================
   RESET
========================================================= */

function resetPrediction() {

    predictionForm?.reset();

    resultEmpty?.classList.remove("hidden");

    resultContent?.classList.add("hidden");

    resultRisk?.classList.remove("high");

    if (resultCircle) {

        resultCircle.style.borderColor =
            "#3b7564";

    }

    window.scrollTo({
        top: $("#prediction")?.offsetTop - 80,
        behavior: "smooth"
    });

}


resetButton?.addEventListener(
    "click",
    resetPrediction
);

resultReset?.addEventListener(
    "click",
    resetPrediction
);


/* =========================================================
   DATASET API
========================================================= */

async function loadDataset() {

    try {

        const response =
            await fetch("/api/dataset");

        if (!response.ok) {
            throw new Error("Dataset unavailable");
        }

        const data =
            await response.json();

        $("#recordCount").textContent =
            data.records;

        $("#featureCount").textContent =
            data.features;

        $("#missingCount").textContent =
            data.missing_values;

        renderDatasetTable(
            data.columns,
            data.sample
        );

    } catch (error) {

        console.error(error);

        $("#recordCount").textContent = "—";
        $("#featureCount").textContent = "—";
        $("#missingCount").textContent = "—";

        const body = $("#datasetBody");

        if (body) {

            body.innerHTML = `
                <tr>
                    <td colspan="6" class="table-loading">
                        Unable to load dataset.
                    </td>
                </tr>
            `;

        }

    }

}


/* =========================================================
   DATASET TABLE
========================================================= */

function renderDatasetTable(
    columns,
    rows
) {

    const head = $("#datasetHead");
    const body = $("#datasetBody");

    if (!head || !body) return;

    /*
        Show first 6 columns to keep table readable.
    */

    const visibleColumns =
        columns.slice(0, 6);

    head.innerHTML = `
        <tr>
            ${visibleColumns
                .map(column => `<th>${escapeHtml(column)}</th>`)
                .join("")}
        </tr>
    `;

    body.innerHTML = "";

    rows.forEach(row => {

        const tr =
            document.createElement("tr");

        visibleColumns.forEach(column => {

            const td =
                document.createElement("td");

            td.textContent =
                row[column] ?? "";

            tr.appendChild(td);

        });

        body.appendChild(tr);

    });

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   CHARTS
========================================================= */

let metricsChart = null;
let riskChart = null;


function createCharts() {

    if (typeof Chart === "undefined") {

        console.warn(
            "Chart.js is not available."
        );

        return;

    }

    const metricsCanvas =
        $("#metricsChart");

    const riskCanvas =
        $("#riskChart");

    if (metricsCanvas) {

        metricsChart = new Chart(
            metricsCanvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Accuracy",
                        "Precision",
                        "Recall",
                        "F1 Score"
                    ],

                    datasets: [
                        {
                            label: "Score",

                            data: [
                                100,
                                100,
                                100,
                                100
                            ],

                            backgroundColor: [
                                "#173f35",
                                "#245c4d",
                                "#3b7564",
                                "#e77c45"
                            ],

                            borderRadius: 7,

                            borderSkipped: false

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 100,

                            ticks: {
                                callback:
                                    value => `${value}%`
                            },

                            grid: {
                                color:
                                    "rgba(100,120,110,.1)"
                            }

                        },

                        x: {

                            grid: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

    }


    if (riskCanvas) {

        riskChart = new Chart(
            riskCanvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Low Risk",
                        "High Risk"
                    ],

                    datasets: [
                        {
                            data: [
                                80,
                                20
                            ],

                            backgroundColor: [
                                "#173f35",
                                "#e77c45"
                            ],

                            borderWidth: 0

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "72%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {
                                usePointStyle: true,
                                padding: 18
                            }

                        }

                    }

                }

            }
        );

    }

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDataset();

        createCharts();

    }
);


/* =========================================================
   MOBILE NAV CSS INJECTION
========================================================= */

const mobileStyle =
    document.createElement("style");

mobileStyle.textContent = `

@media (max-width: 1050px) {

    .nav-links.mobile-open {

        position: fixed;

        top: 78px;

        left: 15px;
        right: 15px;

        display: flex;

        flex-direction: column;

        align-items: stretch;

        padding: 12px;

        background: var(--white);

        border: 1px solid var(--line);

        border-radius: 14px;

        box-shadow: var(--shadow-md);

    }

    .nav-links.mobile-open .nav-link {
        padding: 12px;
    }

}

`;

document.head.appendChild(mobileStyle);