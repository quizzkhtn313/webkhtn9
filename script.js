let classes = JSON.parse(localStorage.getItem('classes')) || [];
let students = JSON.parse(localStorage.getItem('students')) || [];
let tests = JSON.parse(localStorage.getItem('tests')) || [];

// Hiển thị trang
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('page-title').textContent = {
        dashboard: 'Dashboard',
        classes: 'Lớp Học',
        students: 'Học Sinh',
        tests: 'Bài Kiểm Tra',
        scores: 'Sổ Điểm'
    }[pageId];

    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'classes') loadClasses();
    if (pageId === 'students') loadClassSelect();
    if (pageId === 'scores') loadScoreClassSelect();
}

// Cập nhật Dashboard
function updateDashboard() {
    document.getElementById('class-count').textContent = classes.length;
    document.getElementById('student-count').textContent = students.length;
    document.getElementById('test-count').textContent = tests.length;
}

// ==================== QUẢN LÝ LỚP HỌC ====================
function loadClasses() {
    const container = document.getElementById('class-list');
    container.innerHTML = '';

    if (classes.length === 0) {
        container.innerHTML = '<p>Chưa có lớp nào. Hãy thêm lớp mới!</p>';
        return;
    }

    classes.forEach((cls, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <strong>${cls.name}</strong> - ${cls.subject}
                <small style="color:gray"> (${cls.students ? cls.students.length : 0} học sinh)</small>
            </div>
            <button onclick="deleteClass(${index})" style="background:red;color:white;border:none;padding:5px 10px;border-radius:5px;">Xóa</button>
        `;
        container.appendChild(div);
    });
}

function addNewClass() {
    const name = prompt("Nhập tên lớp (ví dụ: Toán 10A1):");
    if (!name) return;

    const subject = prompt("Nhập môn học:", "Toán");
    if (!subject) return;

    classes.push({
        id: Date.now(),
        name: name,
        subject: subject,
        students: []
    });

    saveData();
    loadClasses();
    alert("Đã thêm lớp: " + name);
}

// ==================== QUẢN LÝ HỌC SINH ====================
function loadClassSelect() {
    const select = document.getElementById('class-select');
    select.innerHTML = '<option value="">Chọn lớp...</option>';

    classes.forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls.id;
        opt.textContent = cls.name;
        select.appendChild(opt);
    });
}

function loadStudents() {
    const classId = document.getElementById('class-select').value;
    if (!classId) return;

    const container = document.getElementById('student-list');
    container.innerHTML = '';

    const currentClass = classes.find(c => c.id == classId);
    if (!currentClass) return;

    currentClass.students.forEach((student, idx) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div><strong>${student.name}</strong> - ${student.code}</div>
            <button onclick="deleteStudent(${classId}, ${idx})" style="background:red;color:white;border:none;padding:5px 10px;border-radius:5px;">Xóa</button>
        `;
        container.appendChild(div);
    });
}

function addNewStudent() {
    const classId = document.getElementById('class-select').value;
    if (!classId) {
        alert("Vui lòng chọn lớp trước!");
        return;
    }

    const name = prompt("Nhập họ tên học sinh:");
    if (!name) return;

    const code = prompt("Nhập mã học sinh:", "HS" + Date.now().toString().slice(-4));

    const currentClass = classes.find(c => c.id == classId);
    currentClass.students.push({ id: Date.now(), name: name, code: code });

    saveData();
    loadStudents();
    alert("Đã thêm học sinh: " + name);
}

function deleteStudent(classId, studentIndex) {
    if (confirm("Xóa học sinh này?")) {
        const currentClass = classes.find(c => c.id == classId);
        currentClass.students.splice(studentIndex, 1);
        saveData();
        loadStudents();
    }
}

// ==================== BÀI KIỂM TRA ====================
function createNewTest() {
    const title = prompt("Nhập tiêu đề bài kiểm tra:");
    if (!title) return;

    tests.push({
        id: Date.now(),
        title: title,
        date: new Date().toLocaleDateString('vi-VN'),
        questions: []
    });

    saveData();
    loadTests();
    alert("Đã tạo bài kiểm tra: " + title);
}

function loadTests() {
    const container = document.getElementById('test-list');
    container.innerHTML = '';

    tests.forEach(test => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <strong>${test.title}</strong><br>
                <small>Ngày tạo: ${test.date}</small>
            </div>
        `;
        container.appendChild(div);
    });
}

// ==================== SỔ ĐIỂM ====================
function loadScoreClassSelect() {
    const select = document.getElementById('score-class-select');
    select.innerHTML = '<option value="">Chọn lớp để xem điểm...</option>';

    classes.forEach(cls => {
        const opt = document.createElement('option');
        opt.value = cls.id;
        opt.textContent = cls.name;
        select.appendChild(opt);
    });
}

function loadScores() {
    // Có thể mở rộng sau
    alert("Chức năng sổ điểm đang phát triển. Bạn có thể nhập điểm thủ công trong bước sau.");
}

// Lưu dữ liệu vào localStorage
function saveData() {
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('tests', JSON.stringify(tests));
}

// Khởi động khi mở trang
window.onload = () => {
    showPage('dashboard');
    loadTests();
};