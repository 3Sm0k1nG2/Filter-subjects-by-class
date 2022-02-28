let selectElement = document.getElementById('ctl00_ContentPlaceHolder2_dd_zl');

// 1 = summer, 0 = winter | current season is summer, so we write 1. No idea how to automate this proccess
let isLoaded = selectElement.options.selectedIndex === 1;
injector();


function createAndAppendNewButtons() {
    appendButtonToDiv(createChooseLabSelect());
    appendButtonToDiv(createChooseSemSelect());
}

function createChooseLabSelect() {
    const newSelectElement = document.createElement('select');
    newSelectElement.id = 'lab-btn';

    for (let i = 1; i <= 3; i++) {
        let newOptionElement = document.createElement('option');
        newSelectElement.appendChild(newOptionElement);
        newOptionElement.value = `${i} лаб`;
        newOptionElement.textContent = `${i} лаб`;
    }

    newSelectElement.addEventListener('change', (e) => {
        let indexSem = e.target.options.selectedIndex + 1;

        getFilterSubjectsByGroup(indexSem);
        filterSubjects(indexSem);

        let newSelectElement = document.getElementById('sem-btn');
        newSelectElement.hidden = indexSem === 2 ? false : true;
    })

    return newSelectElement;
}

function appendButtonToDiv(buttonElement){
    const divElement = document.getElementById('ctl00_ContentPlaceHolder2_Panel7').children[0];

    let lastChildElement = divElement.children[divElement.children.length - 1];
    divElement.appendChild(buttonElement);
    divElement.appendChild(lastChildElement);
}

function createChooseSemSelect() {

    const newSelectElement = document.createElement('select');
    newSelectElement.id = 'sem-btn';
    newSelectElement.hidden = true;
    
    for (let i = 1; i <= 2; i++) {
        let newOptionElement = document.createElement('option');
        newSelectElement.appendChild(newOptionElement);
        newOptionElement.value = `${i} сем`;
        newOptionElement.textContent = `${i} сем`;
    }

    newSelectElement.addEventListener('change', (e) => {
        console.log(document.getElementById('lab-btn'));
        console.log(e.target.options.selectedIndex + 1);
        filterSubjects(document.getElementById('lab-btn').options.selectedIndex+1, e.target.options.selectedIndex + 1);
    })

    return newSelectElement;
}


function injector() {
    let semesterSeason = getSemesterSeason();
    setSemesterSeason(semesterSeason);

    filterSubjects();

    createAndAppendNewButtons();
};

function filterSubjects(groupNumberLab = getGroupNumberLab(), groupNumberSem = getGroupNumberSem()){
    let filteredSubjects = getFilterSubjectsByGroup(groupNumberLab, groupNumberSem);
    filteredSubjects = Array.from(filteredSubjects).map((td) => td.parentElement);

    clearBGColor();
    changeBGColor(filteredSubjects, 'gold');
}

function clearBGColor(){
    const DEFAULT_COLOR = 'white';
    const selector = 'tr>td:nth-of-type(4)';
    let elements = document.querySelectorAll(selector);
    elements = Array.from(elements).map( (el) => el.parentElement);

    elements.forEach((el) => {
        el.style.backgroundColor = DEFAULT_COLOR;
    });
}

function changeBGColor(elements, color) {
    elements.forEach((el) => {
        el.style.backgroundColor = color;
    });
}

function getFilterSubjectsByGroup(groupNumberLab = getGroupNumberLab(), groupNumberSem = getGroupNumberSem()) {
    if (!(groupNumberLab >= 1 && groupNumberLab <= 3))
        throw new Error('Wrong parameters received.\n groupNumberLab should be (>= 1 && <= 3), groupNumberSem should be (1 || 2)');

    switch (groupNumberLab) {
        case 1: groupNumberSem = 1; break;
        case 3: groupNumberSem = 2; break;
    }

    const selector = 'tr>td:nth-of-type(4)';
    let tdElements = document.querySelectorAll(selector);

    return Array.from(tdElements).filter((td) => td.innerHTML === '&nbsp;'
        || td.innerText === groupNumberLab + ' лаб'
        || td.innerText === groupNumberSem + ' сем');
}

function getFacultyNumber() {
    return Number(document.getElementById('ctl00_fv_studinfo_fnLabel').textContent);
}

function getGroupNumberLab() {
    return Number(document.getElementById('ctl00_fv_studinfo_grupaLabel').textContent);
}

function getGroupNumberSem(groupNumberSem) {
    const FACULTY_NUMBER_THRESHOLD = 2109011056;
    const facultyNumber = getFacultyNumber();

    return groupNumberSem || (facultyNumber <= FACULTY_NUMBER_THRESHOLD ? 1 : 2);
}

function getSemesterSeason() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1; // January = 1 (0), December = 12 (11)


    // Winter semester 27.09 - 13.02
    // Summer semester 14.02 - 26.06
    const semesters = {
        // {day}.{month}
        winter: {
            start: {
                day: 27,
                month: 9
            },
            end: {
                day: 13,
                month: 02
            }
        },
        summer: {
            start: {
                day: 14,
                month: 2
            },
            end: {
                day: 26,
                month: 06
            }
        }
    }

    for (let semesterName in semesters) {
        semester = semesters[semesterName];

        if (month > semester.start.month && month < semester.end.month)
            return semesterName;

        if(month === semester.start.month)
            if(day >= semester.start.day)
                return semesterName;

        if(month === semester.end.month)
            if(day <= semester.end.day)
                return semesterName;
    }

    throw new Error('Could not get semester season.');
}

function setSemesterSeason(season) {

    const WINTER = 'winter';

    const selectElement = document.getElementById('ctl00_ContentPlaceHolder2_dd_zl');
    const onchangeEvent = new Event('change', {});

    selectElement.options.selectedIndex = season === WINTER ? 0 : 1;

    if (isLoaded)
        return;

    isLoaded = true;
    selectElement.dispatchEvent(onchangeEvent);
}