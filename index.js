class Employee {
  constructor() {
    this.employeeData = [];
    this.paginationLimit = 2;
    this.skip = 0;
  }
  init() {
    this.domSelectors();
    this.render();
    this.domEvents();
  }

  domSelectors() {
    this.overlay = document.querySelector(".overlay");
    this.dropdowns = document.getElementsByClassName("dropdown-content");
    this.modalData = document.querySelector(".modal-data");
  }

  domEvents() {
    const self = this;
    document.addEventListener("click", event => {
      if (!event.target) {
        return;
      }
      if (!event.target.matches(".dropbtn")) {
        self.closeDropDown();
      }
      if (event.target.classList.contains("open-modal")) {
        self.openModal();
      }
      if (event.target.classList.contains("close-modal")) {
        self.closeModal();
      }
      if (event.target.classList.contains("dropbtn")) {
        self.openDropDown(event);
      }
      if (event.target.classList.contains("viewEmployee")) {
        self.employeeInfo(event);
      }
      if (event.target.classList.contains("add-employee")) {
        self.createEmployee(event);
      }
      if (event.target.classList.contains("updateEmployee")) {
        self.updateEmployee(event);
      }
      if (event.target.id === "submitCreateEmployeeForm") {
        self.submitCreateEmployeeData(event);
      }
      if (event.target.id === "submitUpdateEmployeeForm") {
        self.submitUpdateEmployeeData(event);
      }
      if (event.target.tagName === "TH") {
        self.employeeSort(event);
      }
      if (event.target.id === "clear-button") {
        self.clearEmployeeSearch(event);
      }
      if (event.target.classList.contains("deleteEmployee")) {
        self.removeEmployee(event);
      }
      if (event.target.id === "search-button") {
        self.employeeSearch(event);
      }
      if (event.target.id === "next") {
        self.performPagination("next");
      }
      if (event.target.id === "prev") {
        self.performPagination("prev");
      }
    });
  }

  removeEmployee(event) {
    event.preventDefault();
    const empID = event.target.getAttribute("data-id");
    console.log(empID);
    this.employeeData = this.employeeData.filter(item => {
      return item.id !== +empID;
    });
    this.createDomElements();
  }

  clearEmployeeSearch(event) {
    event.preventDefault();
    document.getElementById("search").value = "";
    document.getElementById("searchOn").value = "preferredFullName";
    this.createDomElements(this.employeeData);
  }

  employeeSearch(event) {
    event.preventDefault();
    const searchOn = document.getElementById("searchOn").value;
    const searchVal = document.getElementById("search").value;
    let searchArray = JSON.parse(JSON.stringify(this.employeeData));
    searchArray = searchArray.filter(value => {
      return value[searchOn].includes(searchVal);
    });
    this.createDomElements(searchArray);
  }

  employeeSort(event) {
    const onSort = event.target.getAttribute("data-sort");
    this.employeeData.sort(function(a, b) {
      var nameA = a[onSort];
      var nameB = b[onSort]; // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    this.createDomElements();
  }

  getFormValues() {
    const employeeCode = document.getElementById("empID").value;
    const firstName = document.getElementById("firstname").value;
    const lastName = document.getElementById("lastname").value;
    const jobTitleName = document.getElementById("jobTitle").value;
    const emailAddress = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const region = document.getElementById("region").value;
    const dob = document.getElementById("dob").value;
    return {
      employeeCode,
      firstName,
      lastName,
      preferredFullName: `${firstName} ${lastName}`,
      jobTitleName,
      emailAddress,
      phoneNumber,
      region,
      dob
    };
  }

  submitUpdateEmployeeData(event) {
    event.preventDefault();
    const formData = this.getFormValues();
    this.submitEmployeeDataAjax(
      {
        id: +event.target.getAttribute("data-emp-id"),
        ...formData
      },
      "PUT"
    );
  }

  submitCreateEmployeeData(event) {
    const self = this;
    event.preventDefault();
    const formData = self.getFormValues();
    this.submitEmployeeDataAjax(
      {
        id: Math.floor(Math.random() * 100) + 3,
        ...formData
      },
      "POST"
    );
  }

  updateEmployee(event) {
    const extrctedEmployeeDara = this.extractEmployeeFromArray(
      event.target.getAttribute("data-id")
    );
    const html = this.employeeHTML(extrctedEmployeeDara, "Update");
    this.modalData.innerHTML = html;
    this.openModal();
  }

  async submitEmployeeDataAjax(data, method) {
    const self = this;
    const rawResponse = await fetch(
      `https://my-json-server.typicode.com/darshanp40/employeedb/employees/`,
      {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );
    let content = await rawResponse.json();
    if (Object.keys(content).length === 0) {
      content = data;
    }
    self.updateEmployeeData(content, method);
  }

  updateEmployeeData(newData, method) {
    if (method === "POST") {
      this.employeeData.push(newData);
    } else {
      this.employeeData = this.employeeData.map(item => {
        if (item.id === newData.id) {
          console.log("yes found", item);
          item = Object.assign({}, item, newData);
          console.log(item, newData);
        }
        return item;
      });
      console.log(this.employeeData);
    }
    this.createDomElements();
    this.closeModal();
  }

  createEmployee() {
    const html = this.employeeHTML({}, "Create");
    this.modalData.innerHTML = html;
    this.openModal();
  }

  closeDropDown() {
    const myDropdown = document.querySelectorAll(".myDropdown");
    var i;
    for (i = 0; i < myDropdown.length; i++) {
      var openDropdown = myDropdown[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }

  employeeInfo(event) {
    const extrctedEmployeeDara = this.extractEmployeeFromArray(
      event.target.getAttribute("data-id")
    );
    const infoHTML = this.infoEmployeeHTML(extrctedEmployeeDara);
    this.modalData.innerHTML = infoHTML;
    this.openModal();
  }

  openModal() {
    this.overlay.classList.remove("is-hidden");
  }

  closeModal() {
    this.overlay.classList.add("is-hidden");
  }

  render() {
    this.getEmployeeData().then(data => {
      this.employeeData = data;
      this.createDomElements();
    });
  }

  employeeHTML(
    {
      id = "",
      firstName = "",
      lastName = "",
      emailAddress = "",
      jobTitleName = "",
      dob = "",
      phoneNumber = "",
      preferredFullName = "",
      employeeCode = "",
      region = ""
    },
    currentScreen
  ) {
    return `<form>
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"> ${currentScreen} Employee </h5>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>ID</label>
            <input value="${employeeCode}" type="text" class="form-control" id="empID">
          </div>
          <div class="form-group">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input value="${firstName}" type="text" class="form-control" id="firstname">
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input value="${lastName}" type="text" id="lastname" class="form-control">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label> Job Title </label>
            <input value="${jobTitleName}" type="text" class="form-control" id="jobTitle">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input value="${emailAddress}" type="email" class="form-control" id="email">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Phone Number</label>
            <input value="${phoneNumber}" type="text" class="form-control" id="phoneNumber">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Region</label>
            <input value="${region}" type="text" class="form-control" id="region">
          </div>
          <div class="form-group">
            <label>DOB</label>
            <input value="${dob}" type="text" class="form-control" id="dob">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button data-emp-id="${id}" id="submit${currentScreen}EmployeeForm" type="submit" class="btn btn-primary">Submit</button>
      </div>
    </div>
  </form>`;
  }

  infoEmployeeHTML(data) {
    const {
      preferredFullName,
      employeeCode,
      jobTitleName,
      phoneNumber,
      emailAddress,
      dob
    } = data;
    return `<div class="modal-content">
    <div class="modal-header">
      <h5 class="modal-title">${preferredFullName}</h5>
    </div>
    <div class="modal-body">
      <p>Name: <span> ${preferredFullName} </span> </p>
      <p>Employee Code:  <span> ${employeeCode}</p>
      <p>Job Title: <span> ${jobTitleName}</p>
      <p>Phone Number: <span> ${phoneNumber}</p>
      <p>Email ID: <span> ${emailAddress}</p>
      <p>Region: <span> ${preferredFullName}</p>
      <p>DOB: <span> ${dob}</p>
    </div>
    <div class="modal-footer">
    </div>
  </div>`;
  }

  dropDownHTML(id) {
    return `<button class="dropbtn">...</button>
    <div class="myDropdown dropdown-content">
      <a data-id="${id}" class="viewEmployee" href="#">View</a>
      <a data-id="${id}" class="updateEmployee" href="#">Edit</a>
      <a data-id="${id}" class="deleteEmployee" href="#">Delete</a>
    </div>`;
  }

  extractEmployeeFromArray(id) {
    const employee = this.employeeData.filter(data => {
      return data.id === +id;
    });
    return employee[0];
  }

  openDropDown(event) {
    const sibling = event.target.nextSibling.nextElementSibling;
    sibling.classList.add("show");
  }

  async getEmployeeData() {
    const request = await window.fetch(
      "https://my-json-server.typicode.com/darshanp40/employeedb/employees"
    );
    let data = await request.json();
    return data[0];
  }

  renderEditForm(event) {
    let id = event.target.getAttribute("data-id");
    document.querySelector(".edit-popup").classList.remove("hide");
    document.querySelector(".edit-popup").classList.add("show");
    document.querySelector(".btn-update").setAttribute("data-id", id);
  }

  createDomElements(empData) {
    const data = empData || this.employeeData;
    const self = this;
    let table = document.querySelector("table tbody");
    table.innerHTML = "";
    for (let element of data) {
      let row = table.insertRow();
      row.classList.add("hide");
      const cell1 = row.insertCell();
      cell1.innerHTML = element.id;
      const cell2 = row.insertCell();
      cell2.innerHTML = element.preferredFullName;
      const cell3 = row.insertCell();
      cell3.innerHTML = element.employeeCode;
      const cell5 = row.insertCell();
      cell5.innerHTML = element.jobTitleName;
      const cell6 = row.insertCell();
      cell6.innerHTML = element.phoneNumber;
      const cell7 = row.insertCell();
      cell7.innerHTML = element.emailAddress;
      const cell8 = row.insertCell();
      cell8.innerHTML = element.region;
      const cell9 = row.insertCell();
      cell9.innerHTML = element.dob;
      const dropDownCell = row.insertCell();
      dropDownCell.innerHTML = self.dropDownHTML(element.id);
    }
    self.performPagination();
  }

  performPagination(direction) {
    const self = this;
    let tableRow, tableHide;
    if (!direction) {
      document.getElementById("prev").setAttribute("disabled", true);
      tableRow = document.querySelectorAll(".table tbody tr.hide");
      tableRow.forEach((item, index) => {
        if (index < self.paginationLimit) {
          item.classList.add("show-data");
          item.classList.remove("hide");
        }
      });
    }
    if (direction === "next") {
      let count = 0;
      let reverceCount = 0;
      tableRow = document.querySelectorAll(".table tbody tr");
      tableHide = document.querySelectorAll(".table tbody tr.hide");
      tableRow.forEach((item, index) => {
        if (item.classList.contains("show-data")) {
          if (item.nextSibling && item.nextSibling.classList.contains("hide")) {
            while (
              count < self.paginationLimit &&
              index + count + 1 !== tableRow.length
            ) {
              tableRow[index + count + 1].classList.add("show-data");
              tableRow[index + count + 1].classList.remove("hide");
              count = count + 1;
            }
            while (reverceCount < self.paginationLimit) {
              tableRow[index - reverceCount].classList.add("hide");
              tableRow[index - reverceCount].classList.remove("show-data");
              reverceCount = reverceCount + 1;
            }
            return;
          }
        }
      });
      const tableShow = document.querySelectorAll(".table tr.show-data")[0];

      if (!tableShow.nextSibling) {
        document.getElementById("next").setAttribute("disabled", true);
      }
      if (tableShow.previousSibling) {
        document.getElementById("prev").removeAttribute("disabled", true);
      }
    }
    if (direction === "prev") {
      let count = 0;
      let reverceCount = 0;
      tableRow = document.querySelectorAll(".table tbody tr");
      tableHide = document.querySelectorAll(".table tbody tr.hide");
      tableRow.forEach((item, index) => {
        if (item.classList.contains("hide")) {
          if (
            item.nextSibling &&
            item.nextSibling.classList.contains("show-data")
          ) {
            while (
              count < self.paginationLimit &&
              index + count + 1 !== tableRow.length
            ) {
              tableRow[index + count + 1].classList.add("hide");
              tableRow[index + count + 1].classList.remove("show-data");
              count = count + 1;
            }
            while (reverceCount < self.paginationLimit) {
              tableRow[index - reverceCount].classList.add("show-data");
              tableRow[index - reverceCount].classList.remove("hide");
              reverceCount = reverceCount + 1;
            }
            return;
          }
        }
      });
      const tableShow = document.querySelectorAll(".table tr.show-data")[0];
      if (!tableShow.previousSibling) {
        document.getElementById("prev").setAttribute("disabled", true);
      }
      if (tableShow.nextSibling) {
        document.getElementById("next").removeAttribute("disabled", true);
      }
    }
  }
}

let employee = new Employee();

employee.init();
