/* =========================================================
   JoLearn — APP.JS COMPLET
   Version 3 — A1 → C2
   ========================================================= */

(function(){

"use strict";

const JL = {
    version:"3.0.0",
    storage:"jolearn_complete_v3",
    dailyGoal:50,

    levels:{
        A1:{name:"Débutant",color:"#22c55e",xp:0},
        A2:{name:"Élémentaire",color:"#3b82f6",xp:800},
        B1:{name:"Intermédiaire",color:"#8b5cf6",xp:2000},
        B2:{name:"Intermédiaire supérieur",color:"#f59e0b",xp:4000},
        C1:{name:"Avancé",color:"#ef4444",xp:7000},
        C2:{name:"Maîtrise",color:"#ec4899",xp:11000}
    },

    state:{
        xp:0,
        coins:10,
        streak:0,
        lastDay:"",
        dailyXP:0,
        dailyDay:"",
        completed:[],
        quizDone:[],
        badges:[],
        sound:true,
        dark:false,
        currentLevel:"A1",
        currentLesson:null,
        currentQuiz:null,
        quizIndex:0,
        quizScore:0
    },

    lessons:[]
};

const $ = id => document.getElementById(id);

function today(){
    return new Date().toISOString().slice(0,10);
}

function escapeHTML(v){
    return String(v)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;");
}

function load(){
    try{
        const old=localStorage.getItem(JL.storage);
        if(old) Object.assign(JL.state,JSON.parse(old));
    }catch(e){console.warn(e)}

    if(!Array.isArray(JL.state.completed))JL.state.completed=[];
    if(!Array.isArray(JL.state.quizDone))JL.state.quizDone=[];
    if(!Array.isArray(JL.state.badges))JL.state.badges=[];
    if(JL.state.dailyDay!==today()){
        JL.state.dailyDay=today();
        JL.state.dailyXP=0;
    }
}

function save(){
    localStorage.setItem(JL.storage,JSON.stringify(JL.state));
}

function xpLevel(){
    const x=JL.state.xp;
    if(x>=11000)return 6;
    if(x>=7000)return 5;
    if(x>=4000)return 4;
    if(x>=2000)return 3;
    if(x>=800)return 2;
    return 1;
}

function levelFromNumber(n){
    return ["A1","A2","B1","B2","C1","C2"][n-1];
}

function currentLevel(){
    return levelFromNumber(xpLevel());
}

function unlocked(level){
    const order=["A1","A2","B1","B2","C1","C2"];
    const i=order.indexOf(level);
    if(i<=0)return true;

    const previous=order[i-1];
    const total=JL.lessons.filter(x=>x.level===previous).length;
    const done=JL.lessons.filter(x=>x.level===previous &&
        JL.state.completed.includes(x.id)).length;

    return done>=Math.max(1,Math.ceil(total*.7));
}

function addXP(amount){
    JL.state.xp+=amount;
    JL.state.dailyXP+=amount;
    save();
    updateUI();
}

function addCoins(amount){
    JL.state.coins=Math.max(0,JL.state.coins+amount);
    save();
    updateUI();
}

function completeLesson(id){
    if(!JL.state.completed.includes(id)){
        JL.state.completed.push(id);
        addXP(20);
        addCoins(5);
        updateStreak();
        checkBadges();
    }
    save();
}

function updateStreak(){
    const t=today();

    if(JL.state.lastDay===t)return;

    if(!JL.state.lastDay){
        JL.state.streak=1;
    }else{
        const a=new Date(JL.state.lastDay);
        const b=new Date(t);
        const diff=Math.round((b-a)/86400000);

        if(diff===1)JL.state.streak++;
        else if(diff>1)JL.state.streak=1;
    }

    JL.state.lastDay=t;
}

function speak(text){
    if(!JL.state.sound)return;
    if(!("speechSynthesis" in window))return;

    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang="en-US";
    u.rate=.82;
    speechSynthesis.speak(u);
}

window.JoLearn={
    state:JL.state,
    lessons:JL.lessons,
    save,
    addXP,
    addCoins,
    speak
};
function makeLesson(level,n,title,description,words){
    const id=level.toLowerCase()+"-"+n;

    return {
        id,
        level,
        number:n,
        title,
        description,
        words:words.map(x=>({
            en:x[0],
            fr:x[1],
            ex:x[2]||x[0]+"."
        })),
        quiz:words.slice(0,5).map((x,i)=>({
            q:"Que signifie « "+x[0]+" » ?",
            o:[
                x[1],
                "Une autre expression",
                "Je ne sais pas",
                "Une expression différente"
            ],
            a:0
        }))
    };
}

function addLevel(level,items){
    items.forEach((x,i)=>{
        JL.lessons.push(
            makeLesson(level,i+1,x[0],x[1],x[2])
        );
    });
}

addLevel("A1",[
["Salutations","Les premiers mots pour saluer",
[
["Hello","Bonjour","Hello, Joseph!"],
["Hi","Salut","Hi, my friend!"],
["Good morning","Bonjour le matin","Good morning, teacher."],
["Good evening","Bonsoir","Good evening, everyone."],
["Goodbye","Au revoir","Goodbye! See you tomorrow."],
["See you later","À plus tard","See you later."]
]],
["Présentation","Se présenter simplement",
[
["My name is","Je m'appelle","My name is Joseph."],
["I am","Je suis","I am a student."],
["I live in","J'habite à","I live in Congo."],
["I am from","Je viens de","I am from Africa."],
["Nice to meet you","Enchanté","Nice to meet you."],
["What is your name?","Comment tu t'appelles ?","What is your name?"]
]],
["Famille","Parler de sa famille",
[
["father","père","My father is here."],
["mother","mère","My mother is kind."],
["brother","frère","My brother is young."],
["sister","sœur","My sister is happy."],
["family","famille","My family is big."],
["child","enfant","The child is playing."]
]],
["Maison","Les objets de la maison",
[
["house","maison","This is my house."],
["room","chambre / pièce","My room is small."],
["door","porte","Open the door."],
["window","fenêtre","Close the window."],
["chair","chaise","Sit on the chair."],
["table","table","The book is on the table."]
]],
["Nourriture","Mots alimentaires essentiels",
[
["water","eau","I drink water."],
["bread","pain","I eat bread."],
["rice","riz","I like rice."],
["milk","lait","The milk is cold."],
["food","nourriture","The food is ready."],
["banana","banane","I eat a banana."]
]],
["Actions simples","Les verbes de base",
[
["go","aller","I go home."],
["come","venir","Come here, please."],
["eat","manger","I eat every day."],
["drink","boire","I drink water."],
["sleep","dormir","I sleep at night."],
["read","lire","I read a book."]
]]
]);

addLevel("A2",[
["Routine","Parler de ses habitudes",
[
["wake up","se réveiller","I wake up early."],
["get up","se lever","I get up at six."],
["wash","laver","I wash my face."],
["dress","s'habiller","I dress quickly."],
["work","travailler","I work every morning."],
["study","étudier","I study English."]
]],
["Temps","Parler du temps",
[
["today","aujourd'hui","I am busy today."],
["tomorrow","demain","See you tomorrow."],
["yesterday","hier","I was tired yesterday."],
["morning","matin","I study in the morning."],
["afternoon","après-midi","I work this afternoon."],
["weekend","week-end","I rest at the weekend."]
]],
["Ville","Se déplacer en ville",
[
["street","rue","This street is busy."],
["market","marché","The market is near."],
["school","école","My school is far."],
["hospital","hôpital","The hospital is nearby."],
["station","station","The station is closed."],
["town","ville","This town is beautiful."]
]],
["Voyage","Vocabulaire du voyage",
[
["ticket","billet","I bought a ticket."],
["airport","aéroport","The airport is busy."],
["train","train","The train is late."],
["hotel","hôtel","The hotel is comfortable."],
["passport","passeport","Where is my passport?"],
["travel","voyager","I love to travel."]
]],
["Shopping","Faire des achats",
[
["price","prix","What is the price?"],
["cheap","bon marché","This phone is cheap."],
["expensive","cher","That car is expensive."],
["buy","acheter","I want to buy it."],
["sell","vendre","They sell clothes."],
["money","argent","I need some money."]
]],
["Communication","Communiquer naturellement",
[
["question","question","I have a question."],
["answer","réponse","I know the answer."],
["explain","expliquer","Please explain this."],
["understand","comprendre","I understand you."],
["repeat","répéter","Please repeat."],
["remember","se souvenir","I remember your name."]
]]
]);  
addLevel("B1",[
["Travail","Parler du travail",
[
["career","carrière","I want a successful career."],
["job","emploi","He found a new job."],
["company","entreprise","She works for a technology company."],
["manager","responsable","The manager called me."],
["meeting","réunion","We have a meeting today."],
["experience","expérience","I have two years of experience."]
]],
["Technologie","Technologie du quotidien",
[
["device","appareil","This device is useful."],
["software","logiciel","The software is easy to use."],
["website","site web","I created a website."],
["network","réseau","The network is slow."],
["password","mot de passe","Change your password."],
["download","télécharger","Download the application."]
]],
["Opinions","Exprimer son opinion",
[
["agree","être d'accord","I agree with you."],
["disagree","ne pas être d'accord","I disagree with him."],
["opinion","opinion","In my opinion, it is useful."],
["believe","croire","I believe in you."],
["probably","probablement","He will probably come."],
["however","cependant","However, we can try."]
]],
["Éducation","Parler des études",
[
["education","éducation","Education is important."],
["knowledge","connaissance","Knowledge takes time."],
["skill","compétence","Programming is a useful skill."],
["practice","pratique","Practice makes progress."],
["improve","améliorer","I want to improve my English."],
["learn","apprendre","We learn from mistakes."]
]],
["Relations","Relations humaines",
[
["friendship","amitié","Their friendship is strong."],
["trust","confiance","Trust is important."],
["respect","respect","We should respect others."],
["support","soutenir","My friends support me."],
["advice","conseil","Thank you for your advice."],
["relationship","relation","They have a good relationship."]
]],
["Projets","Parler de ses objectifs",
[
["goal","objectif","My goal is clear."],
["plan","plan","I have a plan."],
["future","avenir","I am thinking about my future."],
["success","réussite","Success requires patience."],
["effort","effort","Your effort matters."],
["achieve","atteindre","I want to achieve my goal."]
]]
]);  
addLevel("B2",[
["Débat","Argumenter",
[
["argument","argument","That is a strong argument."],
["evidence","preuve","We need evidence."],
["claim","affirmation","His claim is difficult to prove."],
["although","bien que","Although it is difficult, I will continue."],
["whereas","alors que","She works whereas he studies."],
["therefore","donc / par conséquent","Therefore, we must act."]
]],
["Business","Anglais professionnel",
[
["strategy","stratégie","We need a better strategy."],
["customer","client","The customer is satisfied."],
["profit","bénéfice","The company made a profit."],
["market","marché","The market is changing."],
["investment","investissement","This investment is risky."],
["opportunity","opportunité","This is a great opportunity."]
]],
["Actualités","Comprendre les informations",
[
["government","gouvernement","The government announced a plan."],
["economy","économie","The economy is growing."],
["society","société","Society is changing."],
["environment","environnement","We must protect the environment."],
["policy","politique / mesure","The new policy starts today."],
["issue","problème / question","This is a serious issue."]
]],
["Communication avancée","Parler avec précision",
[
["suggest","suggérer","I suggest another solution."],
["recommend","recommander","I recommend this book."],
["mention","mentionner","He mentioned your name."],
["clarify","clarifier","Could you clarify that?"],
["assume","supposer","Don't assume anything."],
["consider","considérer","We should consider the risks."]
]],
["Problèmes","Résoudre des problèmes",
[
["solution","solution","We found a solution."],
["challenge","défi","This is a difficult challenge."],
["failure","échec","Failure can teach us."],
["mistake","erreur","Everyone makes mistakes."],
["risk","risque","Every project has a risk."],
["prevent","empêcher / prévenir","We must prevent this problem."]
]],
["Vie professionnelle","Carrière et entreprise",
[
["leadership","leadership / direction","Leadership requires responsibility."],
["employee","employé","The employee arrived early."],
["employer","employeur","The employer offered a contract."],
["responsibility","responsabilité","This is my responsibility."],
["performance","performance","His performance improved."],
["deadline","date limite","We must meet the deadline."]
]]
]); 
addLevel("C1",[
["Analyse","Analyser une situation",
[
["assess","évaluer","We need to assess the situation."],
["evaluate","évaluer","They evaluated the results."],
["analyse","analyser","Scientists analyse the data."],
["complex","complexe","It is a complex problem."],
["significant","important / significatif","There was a significant change."],
["relevant","pertinent","This information is relevant."]
]],
["Nuances","Exprimer des idées précises",
[
["nevertheless","néanmoins","Nevertheless, we continued."],
["moreover","de plus","Moreover, the results were positive."],
["whereby","par lequel","A system whereby users can learn."],
["despite","malgré","Despite the difficulty, he succeeded."],
["regardless","indépendamment de","Regardless of the result, continue."],
["consequently","par conséquent","Consequently, prices increased."]
]],
["Académique","Anglais académique",
[
["research","recherche","The research is important."],
["findings","résultats","The findings are surprising."],
["approach","approche","We need a different approach."],
["methodology","méthodologie","The methodology is clear."],
["theory","théorie","The theory explains the results."],
["framework","cadre","This framework is useful."]
]],
["Leadership","Diriger une équipe",
[
["delegate","déléguer","A manager must delegate tasks."],
["motivate","motiver","Good leaders motivate people."],
["negotiate","négocier","We need to negotiate."],
["collaborate","collaborer","They collaborate effectively."],
["initiative","initiative","She showed great initiative."],
["accountability","responsabilité","Accountability builds trust."]
]],
["Technologie avancée","Informatique et innovation",
[
["algorithm","algorithme","The algorithm processes data."],
["artificial intelligence","intelligence artificielle","Artificial intelligence is developing quickly."],
["database","base de données","The application uses a database."],
["security","sécurité","Cybersecurity is essential."],
["innovation","innovation","Innovation creates opportunities."],
["automation","automatisation","Automation saves time."]
]],
["Carrière","Construire son avenir",
[
["entrepreneurship","entrepreneuriat","Entrepreneurship requires courage."],
["professionalism","professionnalisme","Professionalism matters."],
["achievement","réalisation","This is a major achievement."],
["expertise","expertise","She has technical expertise."],
["potential","potentiel","You have great potential."],
["determination","détermination","Determination leads to progress."]
]]
]);   
addLevel("C2",[
["Maîtrise","Vocabulaire de haut niveau",
[
["substantial","considérable","There was a substantial improvement."],
["compelling","convaincant","The evidence is compelling."],
["intricate","complexe / délicat","The system is intricate."],
["profound","profond","The experience had a profound impact."],
["inevitable","inévitable","Change is inevitable."],
["controversial","controversé","It is a controversial decision."]
]],
["Expression sophistiquée","Expressions avancées",
[
["to some extent","dans une certaine mesure","To some extent, I agree."],
["by no means","loin de là","It is by no means easy."],
["in light of","à la lumière de","In light of the evidence, we changed the plan."],
["on the contrary","au contraire","On the contrary, it helped us."],
["in other words","en d'autres termes","In other words, we need more time."],
["as a matter of fact","en fait","As a matter of fact, he was right."]
]],
["Pensée critique","Analyser profondément",
[
["perspective","point de vue","We need another perspective."],
["assumption","supposition","That assumption is questionable."],
["implication","conséquence / implication","The decision has serious implications."],
["interpretation","interprétation","There are several interpretations."],
["contradiction","contradiction","There is a clear contradiction."],
["distinction","distinction","We must make a distinction."]
]],
["Société","Questions complexes",
[
["inequality","inégalité","Economic inequality is increasing."],
["sustainability","durabilité","Sustainability is essential."],
["democracy","démocratie","Democracy requires participation."],
["globalization","mondialisation","Globalization changed the economy."],
["migration","migration","Migration affects many countries."],
["diversity","diversité","Diversity can strengthen a team."]
]],
["Communication experte","Parler comme un avancé",
[
["articulate","exprimer clairement","She can articulate her ideas."],
["elaborate","développer","Could you elaborate on that?"],
["emphasize","souligner","I want to emphasize this point."],
["acknowledge","reconnaître","We must acknowledge the problem."],
["justify","justifier","You must justify your decision."],
["infer","déduire","We can infer the result."]
]],
["Excellence","Maîtriser son anglais",
[
["mastery","maîtrise","Mastery requires practice."],
["fluency","aisance / fluidité","Fluency comes with practice."],
["accuracy","précision","Accuracy is important."],
["sophisticated","sophistiqué","It is a sophisticated system."],
["exceptional","exceptionnel","She achieved exceptional results."],
["outstanding","remarquable","He did an outstanding job."]
]]
]); 
 function lessonProgress(level){
    const all=JL.lessons.filter(x=>x.level===level);
    const done=all.filter(x=>JL.state.completed.includes(x.id)).length;
    return {done,total:all.length,pct:all.length?Math.round(done/all.length*100):0};
}

function getNextLesson(){
    for(const level of ["A1","A2","B1","B2","C1","C2"]){
        if(!unlocked(level))continue;

        const l=JL.lessons.find(x=>
            x.level===level &&
            !JL.state.completed.includes(x.id)
        );

        if(l)return l;
    }
    return null;
}

function renderLevels(){
    const box=$("levelsContainer");
    if(!box)return;

    box.innerHTML=Object.keys(JL.levels).map(level=>{
        const p=lessonProgress(level);
        const open=unlocked(level);

        return `
        <div class="card" style="margin-bottom:12px;opacity:${open?1:.55}">
            <div style="display:flex;justify-content:space-between">
                <strong>${level} — ${JL.levels[level].name}</strong>
                <span>${open?"🔓":"🔒"} ${p.done}/${p.total}</span>
            </div>
            <div class="progress" style="margin-top:8px">
                <div style="width:${p.pct}%"></div>
            </div>
        </div>`;
    }).join("");
}

function renderLessons(filter=""){
    const box=$("lessonsContainer");
    if(!box)return;

    const q=filter.toLowerCase();

    const list=JL.lessons.filter(l=>{
        return (!q ||
            l.title.toLowerCase().includes(q) ||
            l.level.toLowerCase().includes(q) ||
            l.words.some(w=>
                w.en.toLowerCase().includes(q) ||
                w.fr.toLowerCase().includes(q)
            ));
    });

    box.innerHTML=list.map(l=>{
        const open=unlocked(l.level);
        const done=JL.state.completed.includes(l.id);

        return `
        <div class="card lesson-card"
             data-lesson="${l.id}"
             style="margin-bottom:10px;opacity:${open?1:.55}">
            <div style="display:flex;justify-content:space-between;gap:8px">
                <div>
                    <b>${done?"✅ ":""}${l.level} · ${l.number}. ${escapeHTML(l.title)}</b>
                    <p style="margin-top:5px;color:var(--muted)">
                    ${escapeHTML(l.description)}</p>
                </div>
                <span>${open?"▶️":"🔒"}</span>
            </div>
        </div>`;
    }).join("");

    box.querySelectorAll("[data-lesson]").forEach(el=>{
        el.onclick=()=>{
            const l=JL.lessons.find(x=>x.id===el.dataset.lesson);
            if(l && unlocked(l.level))openLesson(l);
            else toast("🔒 Termine d'abord le niveau précédent.");
        };
    });
           }
   function openLesson(lesson){
    JL.state.currentLesson=lesson.id;
    save();

    if($("lessonLevelTitle"))
        $("lessonLevelTitle").textContent=
        lesson.level+" — "+lesson.title;

    if($("lessonCounter"))
        $("lessonCounter").textContent=
        lesson.number+" / "+JL.lessons.filter(x=>x.level===lesson.level).length;

    if($("lessonContent")){
        $("lessonContent").innerHTML=`
        <div class="card">
            <h2>${escapeHTML(lesson.title)}</h2>
            <p style="color:var(--muted);margin:8px 0 18px">
            ${escapeHTML(lesson.description)}</p>

            ${lesson.words.map((w,i)=>`
            <div class="card word-card"
                 style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between">
                    <div>
                        <h3>${escapeHTML(w.en)}</h3>
                        <p>${escapeHTML(w.fr)}</p>
                    </div>
                    <button onclick="JoLearn.speak(${JSON.stringify(w.en)})">
                        🔊
                    </button>
                </div>
                <small>💬 ${escapeHTML(w.ex)}</small>
            </div>
            `).join("")}

            <button class="primary-btn" id="lessonQuizBtn">
                🧠 Faire le quiz
            </button>
        </div>`;

        $("lessonQuizBtn").onclick=()=>startQuiz(lesson);
    }

    showPage("lessonPage");
}

function startQuiz(lesson){
    JL.state.currentQuiz=lesson.id;
    JL.state.quizIndex=0;
    JL.state.quizScore=0;
    save();
    renderQuiz();
    showPage("quizPage");
}

function renderQuiz(){
    const lesson=JL.lessons.find(x=>x.id===JL.state.currentQuiz);
    if(!lesson)return;

    const i=JL.state.quizIndex;
    const q=lesson.quiz[i];

    if($("quizCounter"))
        $("quizCounter").textContent=
        `Question ${i+1} / ${lesson.quiz.length}`;

    if($("quizContent")){
        $("quizContent").innerHTML=`
        <div class="card">
            <h2>${escapeHTML(q.q)}</h2>

            <div style="margin-top:20px">
            ${q.o.map((o,n)=>`
                <button class="quiz-option"
                        data-answer="${n}"
                        style="display:block;width:100%;
                        padding:14px;margin:8px 0;
                        border:1px solid var(--border);
                        border-radius:12px;background:var(--card);
                        color:var(--text);text-align:left">
                    ${escapeHTML(o)}
                </button>
            `).join("")}
            </div>
        </div>`;

        document.querySelectorAll("[data-answer]").forEach(btn=>{
            btn.onclick=()=>{
                const answer=Number(btn.dataset.answer);

                if(answer===q.a){
                    JL.state.quizScore++;
                    addXP(10);
                    toast("✅ Bonne réponse ! +10 XP");
                }else{
                    toast("❌ Pas tout à fait.");
                }

                document.querySelectorAll("[data-answer]")
                    .forEach(x=>x.disabled=true);

                setTimeout(()=>{
                    JL.state.quizIndex++;

                    if(JL.state.quizIndex>=lesson.quiz.length){
                        finishQuiz(lesson);
                    }else{
                        renderQuiz();
                    }
                },500);
            };
        });
    }
}

function finishQuiz(lesson){
    const score=JL.state.quizScore;
    const total=lesson.quiz.length;

    if(!JL.state.quizDone.includes(lesson.id))
        JL.state.quizDone.push(lesson.id);

    if(score>=Math.ceil(total*.6))
        completeLesson(lesson.id);

    addCoins(Math.max(1,score));

    checkBadges();
    save();

    if($("quizContent")){
        $("quizContent").innerHTML=`
        <div class="card" style="text-align:center">
            <h2>🎉 Quiz terminé !</h2>
            <p style="font-size:28px;margin:15px">
            ${score}/${total}
            </p>
            <p>
            ${score===total?"Excellent ! 🔥":
              score>=3?"Très bien ! 💪":"Continue à pratiquer ! 📚"}
            </p>
            <button class="primary-btn" id="backCourses">
                Continuer
            </button>
        </div>`;

        $("backCourses").onclick=()=>{
            showPage("courses");
            updateUI();
        };
    }
           }
   function checkBadges(){
    const p=JL.state.completed.length;

    const badges=[
        ["first","🌱","Premier pas",p>=1],
        ["five","🔥","5 leçons",p>=5],
        ["ten","⭐","10 leçons",p>=10],
        ["twenty","🏆","20 leçons",p>=20],
        ["fifty","💎","50 leçons",p>=50],
        ["xp1000","⚡","1000 XP",JL.state.xp>=1000],
        ["xp5000","🚀","5000 XP",JL.state.xp>=5000],
        ["streak7","🔥","7 jours",JL.state.streak>=7],
        ["master","👑","Maîtrise",JL.state.xp>=11000]
    ];

    badges.forEach(b=>{
        if(b[3]&&!JL.state.badges.includes(b[0]))
            JL.state.badges.push(b[0]);
    });

    save();
}

function renderRewards(){
    const box=$("badgesContainer");
    if(!box)return;

    const definitions=[
        ["first","🌱","Premier pas"],
        ["five","🔥","5 leçons"],
        ["ten","⭐","10 leçons"],
        ["twenty","🏆","20 leçons"],
        ["fifty","💎","50 leçons"],
        ["xp1000","⚡","1000 XP"],
        ["xp5000","🚀","5000 XP"],
        ["streak7","🔥","7 jours"],
        ["master","👑","Maîtrise"]
    ];

    box.innerHTML=definitions.map(b=>`
        <div class="card" style="display:inline-block;
        width:46%;margin:5px;opacity:
        ${JL.state.badges.includes(b[0])?1:.35}">
            <div style="font-size:30px">${b[1]}</div>
            <b>${b[2]}</b>
        </div>
    `).join("");

    if($("rewardText"))
        $("rewardText").textContent=
        `${JL.state.coins} pièces disponibles`;
}

function updateUI(){
    const xp=JL.state.xp;

    if($("homeXP"))$("homeXP").textContent=xp;
    if($("homeCoins"))$("homeCoins").textContent=JL.state.coins;
    if($("homeStreak"))$("homeStreak").textContent=JL.state.streak;

    if($("profileLevel"))
        $("profileLevel").textContent=
        currentLevel()+" — "+JL.levels[currentLevel()].name;

    if($("profileStats"))
        $("profileStats").innerHTML=`
        <div>⚡ ${xp} XP</div>
        <div>🪙 ${JL.state.coins} pièces</div>
        <div>📚 ${JL.state.completed.length} leçons</div>
        <div>🔥 ${JL.state.streak} jours</div>`;

    const next=getNextLesson();

    if($("homeLesson"))
        $("homeLesson").textContent=
        next?next.title:"🎉 Tous les cours terminés !";

    if($("dailyProgress"))
        $("dailyProgress").textContent=
        `${Math.min(JL.state.dailyXP,JL.dailyGoal)}/${JL.dailyGoal} XP`;

    if($("dailyText"))
        $("dailyText").textContent=
        JL.state.dailyXP>=JL.dailyGoal
        ?"🎉 Objectif quotidien atteint !"
        :"Continue pour atteindre ton objectif.";

    renderLevels();
    renderLessons($("lessonSearch")?.value||"");
    renderRewards();
}

function showPage(id){
    document.querySelectorAll(".page").forEach(p=>{
        p.classList.remove("active");
        p.style.display="none";
    });

    const page=$(id);

    if(page){
        page.classList.add("active");
        page.style.display="block";
    }
}

function toast(message){
    const t=$("toast");

    if(!t){
        alert(message);
        return;
    }

    t.textContent=message;
    t.style.display="block";

    clearTimeout(window.__jlToast);
    window.__jlToast=setTimeout(()=>{
        t.style.display="none";
    },1800);
}
function setupNavigation(){

    const nav={
        home:"home",
        courses:"courses",
        rewards:"rewards",
        profile:"profile",
        settings:"settings"
    };

    Object.keys(nav).forEach(key=>{
        const elements=document.querySelectorAll(
            `[data-page="${key}"], [data-nav="${key}"]`
        );

        elements.forEach(el=>{
            el.onclick=()=>showPage(nav[key]);
        });
    });

    document.querySelectorAll("[data-go]").forEach(el=>{
        el.onclick=()=>showPage(el.dataset.go);
    });

    if($("lessonSearch")){
        $("lessonSearch").addEventListener("input",e=>{
            renderLessons(e.target.value);
        });
    }

    if($("themeSwitch")){
        $("themeSwitch").checked=JL.state.dark;

        $("themeSwitch").onchange=e=>{
            JL.state.dark=e.target.checked;
            document.body.classList.toggle("dark",JL.state.dark);
            save();
        };
    }

    if($("soundSwitch")){
        $("soundSwitch").checked=JL.state.sound;

        $("soundSwitch").onchange=e=>{
            JL.state.sound=e.target.checked;
            save();
        };
    }

    if($("dailyRewardBtn")){
        $("dailyRewardBtn").onclick=()=>{
            const key="dailyReward_"+today();

            if(localStorage.getItem(key)){
                toast("🎁 Récompense déjà récupérée aujourd'hui.");
                return;
            }

            localStorage.setItem(key,"1");
            addCoins(10);
            addXP(5);
            toast("🎁 +10 pièces et +5 XP !");
        };
    }

    document.querySelectorAll("[data-home]").forEach(el=>{
        el.onclick=()=>showPage("home");
    });

    document.querySelectorAll("[data-courses]").forEach(el=>{
        el.onclick=()=>showPage("courses");
    });
}

function repairLegacy(){

    /*
      Si une ancienne version de JoLearn possède déjà
      des données simples dans localStorage, on tente de
      récupérer XP/pièces/série sans écraser les nouvelles données.
    */

    const keys=[
        "jolearn_state",
        "jolearn",
        "jolearn2",
        "jolearn_2_engine"
    ];

    if(JL.state.xp>0)return;

    for(const key of keys){
        try{
            const raw=localStorage.getItem(key);
            if(!raw)continue;

            const d=JSON.parse(raw);

            if(typeof d.xp==="number")
                JL.state.xp=Math.max(JL.state.xp,d.xp);

            if(typeof d.coins==="number")
                JL.state.coins=Math.max(JL.state.coins,d.coins);

            if(typeof d.streak==="number")
                JL.state.streak=Math.max(JL.state.streak,d.streak);

            if(Array.isArray(d.completed))
                JL.state.completed=[
                    ...new Set([
                        ...JL.state.completed,
                        ...d.completed
                    ])
                ];

        }catch(e){}
    }

    save();
}

function start(){

    load();
    repairLegacy();

    document.body.classList.toggle("dark",JL.state.dark);

    checkBadges();
    setupNavigation();
    updateUI();

    if($("homeGreeting")){
        $("homeGreeting").textContent=
        "Bonjour Joseph 👋";
    }

    /*
      Compatibilité avec certains anciens boutons
    */
    window.openLesson=openLesson;
    window.startQuiz=startQuiz;
    window.showPage=showPage;
    window.speak=speak;

    /*
      Si aucune page active n'est définie,
      on affiche l'accueil.
    */
    const active=document.querySelector(".page.active");

    if(!active)showPage("home");

    console.log(
        "JoLearn chargé :",
        JL.lessons.length,
        "leçons — A1 à C2"
    );
}

if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",start);
}else{
    start();
}

})();   
