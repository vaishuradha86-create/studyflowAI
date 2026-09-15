const defaultData={
subjects:[
{name:"Java",teacher:"Dr. Kumar",exam:"2026-10-05",topics:12,completed:7,priority:"High"},
{name:"Mathematics",teacher:"Prof. Priya",exam:"2026-10-12",topics:15,completed:9,priority:"High"},
{name:"Web Design",teacher:"Ms. Anitha",exam:"2026-10-20",topics:10,completed:6,priority:"Medium"},
{name:"Python",teacher:"Mr. Arun",exam:"2026-10-28",topics:14,completed:8,priority:"Medium"}],
tasks:[
{title:"Practice Java Arrays",subject:"Java",due:"2026-09-16",priority:"High",done:false},
{title:"Complete CSS Assignment",subject:"Web Design",due:"2026-09-17",priority:"Medium",done:false},
{title:"Revise Mathematics",subject:"Mathematics",due:"2026-09-16",priority:"High",done:true},
{title:"Practice Python Problems",subject:"Python",due:"2026-09-18",priority:"Medium",done:false}],
sessions:0,xp:0,streak:3,dailyGoal:2,theme:"light"
};
let data=JSON.parse(localStorage.getItem("studyflow"))||structuredClone(defaultData);
let currentFilter="all";

const $=id=>document.getElementById(id);
function save(){localStorage.setItem("studyflow",JSON.stringify(data));render();}
function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
 $(id).classList.add("active");
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 $("pageTitle").textContent=id==="dashboard"?"Dashboard":id==="planner"?"Study Planner":id[0].toUpperCase()+id.slice(1);
 document.querySelector(".sidebar").classList.remove("open");
}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$("menuBtn").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");

function render(){
 document.body.classList.toggle("dark",data.theme==="dark");
 $("sideStreak").textContent=data.streak;
 const completed=data.tasks.filter(t=>t.done).length;
 const hours=data.sessions*.5;
 const overall=Math.round(data.subjects.reduce((a,s)=>a+(s.completed/s.topics)*100,0)/data.subjects.length);
 $("stats").innerHTML=[
 ["📚","Total Subjects",data.subjects.length],["✅","Completed Tasks",completed],["⏱️","Study Hours",hours.toFixed(1)],["🔥","Current Streak",data.streak+" days"]
 ].map(x=>`<div class="stat"><span class="icon">${x[0]}</span><b>${x[2]}</b><span class="muted">${x[1]}</span></div>`).join("");
 $("todayTasks").innerHTML=data.tasks.slice(0,4).map(taskHTML).join("")||empty("No tasks yet.");
 $("exams").innerHTML=data.subjects.map(s=>`<div class="exam-row"><div><b>${s.name}</b><div class="muted">${s.exam}</div></div><span class="tag">${s.priority}</span></div>`).join("");
 $("subjectsGrid").innerHTML=data.subjects.map((s,i)=>`<div class="card subject-card"><h3>${s.name}</h3><p class="muted">${s.teacher}</p><span class="tag">${s.priority} Priority</span><div class="progress"><i style="width:${s.completed/s.topics*100}%"></i></div><small>${s.completed}/${s.topics} topics · ${Math.round(s.completed/s.topics*100)}%</small></div>`).join("");
 $("planSubject").innerHTML=data.subjects.map(s=>`<option>${s.name}</option>`).join("");
 renderTasks(); renderProgress();
 $("sessionsCount").textContent=data.sessions;$("xpCount").textContent=data.xp;
 $("dailyGoal").value=data.dailyGoal;$("theme").value=data.theme;
}
function empty(t){return `<p class="muted">${t}</p>`}
function taskHTML(t,i){
 return `<div class="task-row"><div class="task-main"><input class="check" type="checkbox" ${t.done?"checked":""} onchange="toggleTask(${i})"><div><b class="${t.done?"done":""}">${t.title}</b><div class="muted">${t.subject} · Due ${t.due}</div></div></div><span class="tag ${t.priority==="High"?"priority-high":""}">${t.priority}</span></div>`;
}
function renderTasks(){
 let list=data.tasks.map((t,i)=>({...t,i})).filter(t=>currentFilter==="all"||currentFilter==="pending"&&!t.done||currentFilter==="completed"&&t.done||currentFilter==="high"&&t.priority==="High");
 $("taskList").innerHTML=list.map(t=>taskHTML(t,t.i)).join("")||empty("No matching tasks.");
 document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===currentFilter));
}
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;renderTasks()});
function toggleTask(i){if(!data.tasks[i].done){data.xp+=10}data.tasks[i].done=!data.tasks[i].done;save()}
function openModal(content){$("modalContent").innerHTML=content;$("modal").classList.remove("hidden")}
function closeModal(){$("modal").classList.add("hidden")}
function openTaskModal(){openModal(`<h2>Add Task</h2><label>Title<input id="mTitle" required></label><label>Subject<select id="mSubject">${data.subjects.map(s=>`<option>${s.name}</option>`).join("")}</select></label><label>Due Date<input id="mDue" type="date"></label><label>Priority<select id="mPriority"><option>High</option><option selected>Medium</option><option>Low</option></select></label><button class="primary" onclick="addTask()">Add Task</button>`)}
function addTask(){let title=$("mTitle").value.trim();if(!title)return alert("Please enter a task title.");data.tasks.push({title,subject:$("mSubject").value,due:$("mDue").value||"No date",priority:$("mPriority").value,done:false});closeModal();save()}
function openSubjectModal(){openModal(`<h2>Add Subject</h2><label>Subject Name<input id="sName"></label><label>Teacher<input id="sTeacher"></label><label>Exam Date<input id="sExam" type="date"></label><label>Total Topics<input id="sTopics" type="number" min="1" value="10"></label><label>Priority<select id="sPriority"><option>High</option><option selected>Medium</option><option>Low</option></select></label><button class="primary" onclick="addSubject()">Add Subject</button>`)}
function addSubject(){let name=$("sName").value.trim();if(!name)return alert("Please enter a subject name.");data.subjects.push({name,teacher:$("sTeacher").value||"Not assigned",exam:$("sExam").value||"TBD",topics:+$("sTopics").value||10,completed:0,priority:$("sPriority").value});closeModal();save()}
function generatePlan(){
 const subject=$("planSubject").value, topics=$("planTopics").value.split(",").map(x=>x.trim()).filter(Boolean), hours=+$("planHours").value||2, difficulty=$("planDifficulty").value, exam=$("planExam").value;
 if(!topics.length){$("planOutput").innerHTML=empty("Add topics to generate your plan.");return}
 const perDay=Math.max(1,Math.floor(hours*60/45)), days=Math.ceil(topics.length/perDay);
 $("planOutput").innerHTML=`<div class="card"><h3>${subject} · ${difficulty} Plan</h3><p class="muted">${exam?`Target exam: ${exam} · `:""}${hours} hour(s)/day</p></div>`+topics.map((t,i)=>`<div class="plan-item"><b>Day ${Math.floor(i/perDay)+1}</b> · ${t}<div class="muted">45 min focused study + 10 min review</div></div>`).join("");
}
let seconds=1500, timerId=null;
function updateTimer(){$("timer").textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0")}
$("timerBtn").onclick=()=>{if(timerId){clearInterval(timerId);timerId=null;$("timerBtn").textContent="Start";return}timerId=setInterval(()=>{seconds--;updateTimer();if(seconds<=0){clearInterval(timerId);timerId=null;seconds=1500;data.sessions++;data.xp+=20;save();alert("Focus session completed! +20 XP");$("timerBtn").textContent="Start"}},1000);$("timerBtn").textContent="Pause"};
$("resetBtn").onclick=()=>{clearInterval(timerId);timerId=null;seconds=1500;updateTimer();$("timerBtn").textContent="Start"};
function renderProgress(){
 const completed=data.tasks.filter(t=>t.done).length, overall=Math.round(data.subjects.reduce((a,s)=>a+(s.completed/s.topics)*100,0)/data.subjects.length);
 $("progressStats").innerHTML=[["📊","Overall Progress",overall+"%"],["✅","Tasks Completed",completed],["🔥","Streak",data.streak+" days"],["⭐","XP",data.xp]].map(x=>`<div class="stat"><span class="icon">${x[0]}</span><b>${x[2]}</b><span class="muted">${x[1]}</span></div>`).join("");
 $("progressSubjects").innerHTML=data.subjects.map(s=>`<div class="subject-row"><div><b>${s.name}</b><div class="progress"><i style="width:${s.completed/s.topics*100}%"></i></div></div><b>${Math.round(s.completed/s.topics*100)}%</b></div>`).join("");
}
function saveSettings(){data.dailyGoal=+$("dailyGoal").value||2;data.theme=$("theme").value;save();alert("Settings saved.")}
function resetData(){if(confirm("Reset StudyFlow demo data?")){data=structuredClone(defaultData);save()}}
render();updateTimer();