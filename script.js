// Load Data or Create Demo Data
let data = JSON.parse(localStorage.getItem('lib_erp_v3'));

if (!data) {
    data = {
        books: [
            { id: 1, title: "The Alchemist", author: "Paulo Coelho", status: "Available" },
            { id: 2, title: "Atomic Habits", author: "James Clear", status: "Issued" },
            { id: 3, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", status: "Available" },
            { id: 4, title: "Think and Grow Rich", author: "Napoleon Hill", status: "Available" }
        ],

        students: [
            { id: 101, name: "Ali Khan", roll: "BSCS-01" },
            { id: 102, name: "Sara Ahmed", roll: "BSCS-02" },
            { id: 103, name: "Hassan Raza", roll: "BSCS-03" }
        ],

        issues: [
            {
                id: 201,
                bookTitle: "Atomic Habits",
                bookId: 2,
                studentName: "Sara Ahmed",
                dueDate: "2024-01-01"
            }
        ],

        attendance: [
            { date: "1/1/2024", roll: "BSCS-01", name: "Ali Khan", status: "Present" },
            { date: "1/1/2024", roll: "BSCS-02", name: "Sara Ahmed", status: "Present" }
        ]
    };

    localStorage.setItem('lib_erp_v3', JSON.stringify(data));
}

// Page Switch
function showPage(el, id) {
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    render();
}

// Add Book
document.getElementById('bookForm').addEventListener('submit', (e) => {
    e.preventDefault();
    data.books.push({
        id: Date.now(),
        title: document.getElementById('bt').value,
        author: document.getElementById('ba').value,
        status: 'Available'
    });
    save();
    e.target.reset();
});

// Add Student
document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    data.students.push({
        id: Date.now(),
        name: document.getElementById('sn').value,
        roll: document.getElementById('sr').value
    });
    save();
    e.target.reset();
});

// Issue Book
function issuePrompt(bookId) {
    const roll = prompt("Enter Student Roll Number:");
    const student = data.students.find(s => s.roll === roll);
    if (!student) return alert("Student not registered!");

    const days = prompt("Issue for how many days?", "7");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const bIndex = data.books.findIndex(b => b.id === bookId);
    data.books[bIndex].status = 'Issued';

    data.issues.push({
        id: Date.now(),
        bookTitle: data.books[bIndex].title,
        bookId: bookId,
        studentName: student.name,
        dueDate: dueDate.toISOString().split('T')[0]
    });

    save();
}

// Fine Calculation
function calculateFine(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    if (today > due) {
        const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
        return diffDays * 10;
    }
    return 0;
}

// Return Book
function returnBook(issueId) {
    const issue = data.issues.find(i => i.id === issueId);
    const bIndex = data.books.findIndex(b => b.id === issue.bookId);
    data.books[bIndex].status = 'Available';
    data.issues = data.issues.filter(i => i.id !== issueId);
    save();
}

// Delete Student (Safe)
function deleteStudent(studentId) {
    const hasIssued = data.issues.some(i => {
        const student = data.students.find(s => s.id === studentId);
        return student && i.studentName === student.name;
    });

    if (hasIssued) {
        alert("Cannot delete! Student has issued books.");
        return;
    }

    data.students = data.students.filter(s => s.id !== studentId);
    save();
}

// Delete Book (Safe)
function deleteBook(bookId) {
    const isIssued = data.issues.some(i => i.bookId === bookId);
    if (isIssued) {
        alert("Cannot delete! Book is issued.");
        return;
    }

    data.books = data.books.filter(b => b.id !== bookId);
    save();
}

// Attendance
function markAllAttendance() {
    const today = new Date().toLocaleDateString();

    const alreadyMarked = data.attendance.some(a => a.date === today);
    if (alreadyMarked) {
        alert("Today's attendance already recorded!");
        return;
    }

    data.students.forEach(s => {
        data.attendance.push({
            date: today,
            roll: s.roll,
            name: s.name,
            status: 'Present'
        });
    });

    save();
    alert("Attendance recorded!");
}

// Search (Books + Students)
function handleSearch() {
    const q = document.getElementById('globalSearch').value.toLowerCase();
    const resDiv = document.getElementById('searchRes');
    if (!q) { resDiv.innerHTML = ""; return; }

    const bookResults = data.books.filter(b =>
        b.title.toLowerCase().includes(q)
    );

    const studentResults = data.students.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.roll.toLowerCase().includes(q)
    );

    let html = "";

    bookResults.forEach(b => {
        html += `<div style="padding:8px;border-bottom:1px solid #444">
        📘 ${b.title} (${b.status})
        </div>`;
    });

    studentResults.forEach(s => {
        html += `<div style="padding:8px;border-bottom:1px solid #444">
        👤 ${s.name} (Roll: ${s.roll})
        </div>`;
    });

    resDiv.innerHTML = html || "No results found";
}

// Save & Render
function save() {
    localStorage.setItem('lib_erp_v3', JSON.stringify(data));
    render();
}

function render() {
    document.getElementById('count-books').innerText = data.books.length;
    document.getElementById('count-students').innerText = data.students.length;
    document.getElementById('count-issued').innerText = data.issues.length;

    let totalFine = 0;
    data.issues.forEach(i => totalFine += calculateFine(i.dueDate));
    document.getElementById('count-fine').innerText = "₹" + totalFine;

    document.querySelector('#bookTable tbody').innerHTML = data.books.map(b => `
        <tr>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td style="color:${b.status==='Available'?'#22c55e':'#ef4444'}">${b.status}</td>
            <td>
                ${b.status==='Available'
                ? `<button class="btn btn-success" onclick="issuePrompt(${b.id})">Issue</button>
                   <button class="btn btn-danger" onclick="deleteBook(${b.id})">Del</button>`
                : '-'}
            </td>
        </tr>
    `).join('');

    document.querySelector('#issueTable tbody').innerHTML = data.issues.map(i => {
        const fine = calculateFine(i.dueDate);
        return `
        <tr>
            <td>${i.bookTitle}</td>
            <td>${i.studentName}</td>
            <td>${i.dueDate}</td>
            <td class="fine-text">₹${fine}</td>
            <td><button class="btn btn-add" onclick="returnBook(${i.id})">Return</button></td>
        </tr>
        `;
    }).join('');

    document.querySelector('#studentTable tbody').innerHTML = data.students.map(s => `
        <tr>
            <td>${s.roll}</td>
            <td>${s.name}</td>
            <td><button class="btn btn-danger" onclick="deleteStudent(${s.id})">Del</button></td>
        </tr>
    `).join('');

    document.querySelector('#attendanceTable tbody').innerHTML =
        data.attendance.slice(-10).map(a => `
        <tr>
            <td>${a.date}</td>
            <td>${a.roll}</td>
            <td>${a.name}</td>
            <td style="color:#22c55e">${a.status}</td>
        </tr>
    `).join('');
}

// Initial Load
render();




