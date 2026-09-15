/* ============================================================
   JoLearn 2.0
   MOTEUR D'AMÉLIORATION
   Partie 1/10
   ============================================================ */

(function(){

"use strict";

/* ============================================================
   1. CONFIGURATION
   ============================================================ */

const JL2 = {

    version: "2.0.0",

    storageKey: "jolearn_2_engine",

    dailyGoal: 50,

    levels: {

        A1: {
            icon: "🌱",
            name: "A1 — Débutant",
            xpRequired: 0
        },

        A2: {
            icon: "🚀",
            name: "A2 — Élémentaire",
            xpRequired: 250
        },

        B1: {
            icon: "🏆",
            name: "B1 — Intermédiaire",
            xpRequired: 700
        }

    },

    colors: {
        primary: "#4f46e5"
    },

    initialized: false,

    lastCompletedCount: 0,

    lastXP: 0,

    notificationShown: false

};


/* ============================================================
   2. OUTILS
   ============================================================ */

function safeNumber(value, fallback){

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function escape(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


function today(){

    return new Date().toLocaleDateString("fr-FR");

}


function getState(){

    try{

        if(typeof state !== "undefined"){
            return state;
        }

    }catch(error){}

    return null;

}


function getLessons(){

    try{

        if(typeof lessons !== "undefined"){
            return lessons;
        }

    }catch(error){}

    return [];

}


function save(){

    try{

        if(typeof saveState === "function"){
            saveState();
        }

    }catch(error){

        console.warn(
            "JoLearn 2.0 : sauvegarde impossible."
        );

    }

}


/* ============================================================
   FIN PARTIE 1
   ============================================================
  */
 /* ============================================================
   JoLearn 2.0 — PARTIE 2/6
   XP • NIVEAUX • BADGES • RÉCOMPENSES
   ============================================================ */


/* ============================================================
   1. CALCUL DU NIVEAU XP
   ============================================================ */

function getXPLevel(xp){

    xp = safeNumber(xp,0);

    if(xp >= JL2.levels.B1.xpRequired){

        return "B1";

    }

    if(xp >= JL2.levels.A2.xpRequired){

        return "A2";

    }

    return "A1";

}


/* ============================================================
   2. INFORMATIONS SUR LE NIVEAU
   ============================================================ */

function getLevelInfo(){

    const s = getState();

    const xp =
        s
            ? safeNumber(s.xp,0)
            : 0;

    const level =
        getXPLevel(xp);

    const info =
        JL2.levels[level];


    let nextLevel = null;


    if(level === "A1"){

        nextLevel = "A2";

    }else if(level === "A2"){

        nextLevel = "B1";

    }


    let nextXP = 0;

    let remaining = 0;


    if(nextLevel){

        nextXP =
            JL2.levels[
                nextLevel
            ].xpRequired;


        remaining =
            Math.max(
                0,
                nextXP - xp
            );

    }


    let percent = 100;


    if(nextLevel){

        const currentXP =
            JL2.levels[
                level
            ].xpRequired;


        const total =
            nextXP - currentXP;


        percent =
            total > 0

                ? Math.min(

                    100,

                    Math.round(

                        (
                            (
                                xp -
                                currentXP
                            ) /

                            total

                        ) * 100

                    )

                )

                : 0;

    }


    return {

        level,

        name:
            info.name,

        icon:
            info.icon,

        xp,

        nextLevel,

        nextXP,

        remaining,

        percent

    };

}


/* ============================================================
   3. AJOUTER DE L'XP
   ============================================================ */

function addXP(amount, reason){

    const s = getState();


    if(!s){

        return;

    }


    amount =
        Math.max(
            0,
            safeNumber(
                amount,
                0
            )
        );


    if(amount <= 0){

        return;

    }


    const before =
        safeNumber(
            s.xp,
            0
        );


    const beforeLevel =
        getXPLevel(before);


    s.xp =
        before + amount;


    s.dailyXP =
        safeNumber(
            s.dailyXP,
            0
        ) + amount;


    const afterLevel =
        getXPLevel(
            s.xp
        );


    save();


    saveEngineData();


    showXPPop(
        "+" + amount + " XP"
    );


    if(
        beforeLevel !==
        afterLevel
    ){

        setTimeout(

            function(){

                showToast(

                    "🎉 Nouveau niveau : " +
                    JL2.levels[
                        afterLevel
                    ].name

                );

            },

            700

        );

    }


    if(reason){

        console.log(
            "JoLearn XP :",
            reason,
            "+" + amount
        );

    }


    refreshAll();

}


/* ============================================================
   4. ANIMATION XP
   ============================================================ */

function showXPPop(text){

    const old =
        document.querySelector(
            ".xp-pop"
        );


    if(old){

        old.remove();

    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "xp-pop";


    element.textContent =
        text;


    document.body.appendChild(
        element
    );


    setTimeout(

        function(){

            element.remove();

        },

        1100

    );

}


/* ============================================================
   5. PIÈCES
   ============================================================ */

function addCoins(amount){

    const s = getState();


    if(!s){

        return;

    }


    amount =
        Math.max(
            0,
            safeNumber(
                amount,
                0
            )
        );


    s.coins =
        safeNumber(
            s.coins,
            0
        ) + amount;


    save();

    saveEngineData();

    refreshAll();

}


/* ============================================================
   6. BADGES AVANCÉS
   ============================================================ */

function getAdvancedBadges(){

    const s = getState();


    if(!s){

        return [];

    }


    const completed =
        Array.isArray(
            s.completed
        )

            ? s.completed.length

            : 0;


    const xp =
        safeNumber(
            s.xp,
            0
        );


    const streak =
        safeNumber(
            s.streak,
            0
        );


    const quizTotal =
        safeNumber(
            s.quizTotal,
            0
        );


    const quizCorrect =
        safeNumber(
            s.quizCorrect,
            0
        );


    const accuracy =
        quizTotal > 0

            ? Math.round(

                (
                    quizCorrect /
                    quizTotal

                ) * 100

            )

            : 0;


    return [

        {
            id:"jl2_first",

            icon:"🌟",

            title:"Premier pas",

            description:
                "Terminer ta première leçon",

            unlocked:
                completed >= 1
        },


        {
            id:"jl2_10",

            icon:"📚",

            title:"10 leçons",

            description:
                "Terminer 10 leçons",

            unlocked:
                completed >= 10
        },


        {
            id:"jl2_25",

            icon:"🔥",

            title:"Apprenant sérieux",

            description:
                "Terminer 25 leçons",

            unlocked:
                completed >= 25
        },


        {
            id:"jl2_50",

            icon:"🏅",

            title:"50 leçons",

            description:
                "Terminer 50 leçons",

            unlocked:
                completed >= 50
        },


        {
            id:"jl2_100",

            icon:"👑",

            title:"Maître des cours",

            description:
                "Terminer 100 leçons",

            unlocked:
                completed >= 100
        },


        {
            id:"jl2_xp100",

            icon:"⚡",

            title:"100 XP",

            description:
                "Gagner 100 XP",

            unlocked:
                xp >= 100
        },


        {
            id:"jl2_xp500",

            icon:"💎",

            title:"500 XP",

            description:
                "Gagner 500 XP",

            unlocked:
                xp >= 500
        },


        {
            id:"jl2_xp1000",

            icon:"👑",

            title:"1000 XP",

            description:
                "Gagner 1000 XP",

            unlocked:
                xp >= 1000
        },


        {
            id:"jl2_xp5000",

            icon:"💫",

            title:"5000 XP",

            description:
                "Gagner 5000 XP",

            unlocked:
                xp >= 5000
        },


        {
            id:"jl2_streak3",

            icon:"🔥",

            title:"3 jours",

            description:
                "Maintenir une série de 3 jours",

            unlocked:
                streak >= 3
        },


        {
            id:"jl2_streak7",

            icon:"🚀",

            title:"7 jours",

            description:
                "Maintenir une série de 7 jours",

            unlocked:
                streak >= 7
        },


        {
            id:"jl2_streak30",

            icon:"🏆",

            title:"30 jours",

            description:
                "Maintenir une série de 30 jours",

            unlocked:
                streak >= 30
        },


        {
            id:"jl2_quiz90",

            icon:"🧠",

            title:"Excellent",

            description:
                "Atteindre 90% de précision",

            unlocked:
                accuracy >= 90
        },


        {
            id:"jl2_quiz100",

            icon:"🎯",

            title:"Parfait",

            description:
                "Obtenir 100% de précision",

            unlocked:
                quizTotal >= 5 &&
                accuracy >= 100
        }

    ];

}


/* ============================================================
   7. DÉBLOQUER AUTOMATIQUEMENT LES BADGES
   ============================================================ */

function checkBadges(){

    const s = getState();


    if(!s){

        return;

    }


    if(
        !Array.isArray(
            s.badges
        )
    ){

        s.badges = [];

    }


    const badges =
        getAdvancedBadges();


    let newBadge = false;


    badges.forEach(

        function(badge){

            if(
                badge.unlocked &&
                !s.badges.includes(
                    badge.id
                )
            ){

                s.badges.push(
                    badge.id
                );


                newBadge = true;


                setTimeout(

                    function(){

                        showToast(

                            "🏆 Badge débloqué : " +
                            badge.title

                        );

                    },

                    500

                );

            }

        }

    );


    if(newBadge){

        save();

    }

}


/* ============================================================
   8. OBJECTIF QUOTIDIEN
   ============================================================ */

function getDailyProgress(){

    const s = getState();


    if(!s){

        return {

            xp:0,

            goal:
                JL2.dailyGoal,

            percent:0,

            completed:false

        };

    }


    const xp =
        Math.max(

            0,

            safeNumber(
                s.dailyXP,
                0
            )

        );


    const goal =
        JL2.dailyGoal;


    const percent =
        Math.min(

            100,

            Math.round(
                (
                    xp /
                    goal
                ) * 100
            )

        );


    return {

        xp,

        goal,

        percent,

        completed:
            xp >= goal

    };

}


/* ============================================================
   9. BONUS OBJECTIF QUOTIDIEN
   ============================================================ */

function checkDailyGoal(){

    const s = getState();


    if(!s){

        return;

    }


    const daily =
        getDailyProgress();


    if(
        daily.completed &&
        s.dailyRewardDate !==
        today()
    ){

        s.dailyRewardDate =
            today();


        s.coins =
            safeNumber(
                s.coins,
                0
            ) + 10;


        save();


        setTimeout(

            function(){

                showToast(
                    "🎁 Objectif atteint ! +10 pièces"
                );

            },

            900

        );

    }

}


/* ============================================================
   10. SÉRIE DE JOURS
   ============================================================ */

function updateStreak(){

    const s = getState();


    if(!s){

        return;

    }


    const currentDate =
        today();


    if(!s.lastStudyDate){

        s.lastStudyDate =
            currentDate;

        s.streak = 1;

        save();

        return;

    }


    if(
        s.lastStudyDate ===
        currentDate
    ){

        return;

    }


    const last =
        parseFrenchDate(
            s.lastStudyDate
        );


    const current =
        parseFrenchDate(
            currentDate
        );


    if(
        !last ||
        !current
    ){

        s.lastStudyDate =
            currentDate;

        save();

        return;

    }


    const difference =
        Math.floor(

            (
                current -
                last
            ) /

            (
                1000 *
                60 *
                60 *
                24
            )

        );


    if(
        difference === 1
    ){

        s.streak =
            safeNumber(
                s.streak,
                0
            ) + 1;

    }else{

        s.streak = 1;

    }


    s.lastStudyDate =
        currentDate;


    save();


    checkBadges();

}


/* ============================================================
   11. CONVERSION DATE FRANÇAISE
   ============================================================ */

function parseFrenchDate(value){

    if(!value){

        return null;

    }


    const parts =
        String(value)
            .split("/");


    if(parts.length !== 3){

        return null;

    }


    const day =
        Number(parts[0]);


    const month =
        Number(parts[1]) - 1;


    const year =
        Number(parts[2]);


    const date =
        new Date(
            year,
            month,
            day
        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return null;

    }


    return date;

}


/* ============================================================
   12. RÉCOMPENSE QUOTIDIENNE
   ============================================================ */

function claimDailyReward(){

    const s = getState();


    if(!s){

        return;

    }


    const date =
        today();


    if(
        s.rewardClaimedDate ===
        date
    ){

        showToast(
            "🎁 Tu as déjà récupéré ta récompense aujourd'hui."
        );

        return;

    }


    const reward =
        10;


    s.coins =
        safeNumber(
            s.coins,
            0
        ) + reward;


    s.rewardClaimedDate =
        date;


    save();

    saveEngineData();


    showToast(
        "🎁 +10 pièces !"
    );


    refreshAll();

}


/* ============================================================
   13. RÉCOMPENSE DE LEÇON
   ============================================================ */

function rewardLesson(){

    updateStreak();


    addXP(
        10,
        "Leçon terminée"
    );


    addCoins(
        2
    );


    checkBadges();

    checkDailyGoal();

}


/* ============================================================
   14. RÉCOMPENSE DE QUIZ
   ============================================================ */

function rewardQuiz(correct){

    const s = getState();


    if(!s){

        return;

    }


    const xp =
        correct
            ? 5
            : 1;


    addXP(
        xp,
        correct
            ? "Bonne réponse"
            : "Réponse quiz"
    );


    if(correct){

        addCoins(1);

    }


    checkBadges();

    checkDailyGoal();

}


/* ============================================================
   15. EXPORTER LES FONCTIONS
   ============================================================ */

window.JoLearn2 = {

    config: JL2,

    getState,

    getLessons,

    getStatistics,

    getLevelInfo,

    getXPLevel,

    getGlobalProgress,

    getLevelProgress,

    findNextLesson,

    getAdvancedBadges,

    getDailyProgress,

    addXP,

    addCoins,

    rewardLesson,

    rewardQuiz,

    claimDailyReward,

    updateStreak,

    checkBadges,

    repairState,

    refreshAll:function(){

        if(
            typeof refreshAll ===
            "function"
        ){

            refreshAll();

        }

    }

};


/* ============================================================
   PARTIE 2 TERMINÉE
   ============================================================ 
   *//* ============================================================
   JoLearn 2.0 — PARTIE 3/6
   INTERFACE • PROGRESSION • CARTES • NIVEAUX
   ============================================================ */


/* ============================================================
   1. OUTIL DOM
   ============================================================ */

function JL2_getElement(id){

    return document.getElementById(id);

}


/* ============================================================
   2. CRÉER UNE CARTE JoLearn 2.0
   ============================================================ */

function JL2_createCard(className){

    const card =
        document.createElement("div");

    card.className =
        className || "jl2-card";

    return card;

}


/* ============================================================
   3. STYLE DYNAMIQUE
   ============================================================ */

function JL2_addStyles(){

    if(
        document.getElementById(
            "jolearn2Styles"
        )
    ){

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "jolearn2Styles";


    style.textContent = `

    .jl2-card{
        background:var(--card,#fff);
        border:1px solid var(--border,#e5e7eb);
        border-radius:20px;
        padding:16px;
        margin-bottom:14px;
        box-shadow:0 4px 16px rgba(0,0,0,.04);
    }

    .jl2-level-card{
        position:relative;
        overflow:hidden;
        border-radius:22px;
        padding:20px;
        margin-bottom:15px;
        background:linear-gradient(
            135deg,
            var(--primary,#4f46e5),
            var(--primary2,#6366f1)
        );
        color:#fff;
    }

    .jl2-level-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
    }

    .jl2-level-icon{
        width:52px;
        height:52px;
        border-radius:16px;
        background:rgba(255,255,255,.18);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:28px;
    }

    .jl2-level-title{
        flex:1;
    }

    .jl2-level-title strong{
        display:block;
        font-size:18px;
    }

    .jl2-level-title span{
        display:block;
        opacity:.85;
        font-size:13px;
        margin-top:3px;
    }

    .jl2-xp-number{
        font-size:13px;
        font-weight:700;
        white-space:nowrap;
    }

    .jl2-progress{
        height:10px;
        background:rgba(255,255,255,.2);
        border-radius:20px;
        overflow:hidden;
        margin-top:17px;
    }

    .jl2-progress-fill{
        height:100%;
        width:0;
        border-radius:20px;
        background:#fff;
        transition:width .5s ease;
    }

    .jl2-next{
        margin-top:9px;
        font-size:12px;
        opacity:.9;
    }

    .jl2-stats-grid{
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:10px;
        margin-bottom:15px;
    }

    .jl2-stat{
        background:var(--card,#fff);
        border:1px solid var(--border,#e5e7eb);
        border-radius:18px;
        padding:15px;
    }

    .jl2-stat-icon{
        font-size:23px;
        margin-bottom:6px;
    }

    .jl2-stat-value{
        font-size:22px;
        font-weight:800;
        color:var(--text,#172033);
    }

    .jl2-stat-label{
        color:var(--muted,#718096);
        font-size:12px;
        margin-top:3px;
    }

    .jl2-daily{
        background:var(--card,#fff);
        border:1px solid var(--border,#e5e7eb);
        border-radius:20px;
        padding:17px;
        margin-bottom:15px;
    }

    .jl2-daily-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
    }

    .jl2-daily-title{
        font-weight:800;
        color:var(--text,#172033);
    }

    .jl2-daily-value{
        font-size:13px;
        font-weight:700;
        color:var(--primary,#4f46e5);
    }

    .jl2-daily-bar{
        height:11px;
        border-radius:20px;
        overflow:hidden;
        background:#e5e7eb;
        margin-top:12px;
    }

    .jl2-daily-fill{
        width:0;
        height:100%;
        border-radius:20px;
        background:linear-gradient(
            90deg,
            var(--primary,#4f46e5),
            var(--primary2,#6366f1)
        );
        transition:width .5s ease;
    }

    .jl2-daily-complete{
        margin-top:10px;
        font-size:13px;
        font-weight:700;
    }

    .jl2-next-card{
        display:flex;
        align-items:center;
        gap:14px;
        padding:17px;
        background:var(--card,#fff);
        border:1px solid var(--border,#e5e7eb);
        border-radius:20px;
        margin-bottom:15px;
    }

    .jl2-next-icon{
        width:50px;
        height:50px;
        border-radius:16px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#eef2ff;
        font-size:24px;
        flex-shrink:0;
    }

    .jl2-next-info{
        flex:1;
        min-width:0;
    }

    .jl2-next-info strong{
        display:block;
        color:var(--text,#172033);
        font-size:15px;
    }

    .jl2-next-info span{
        display:block;
        color:var(--muted,#718096);
        font-size:12px;
        margin-top:4px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
    }

    .jl2-next-button{
        border:0;
        background:var(--primary,#4f46e5);
        color:#fff;
        border-radius:12px;
        padding:10px 13px;
        font-weight:700;
        cursor:pointer;
    }

    .jl2-section-title{
        font-size:18px;
        font-weight:800;
        color:var(--text,#172033);
        margin:18px 0 12px;
    }

    .jl2-level-list{
        display:grid;
        gap:10px;
    }

    .jl2-mini-level{
        border:1px solid var(--border,#e5e7eb);
        background:var(--card,#fff);
        border-radius:18px;
        padding:15px;
    }

    .jl2-mini-top{
        display:flex;
        align-items:center;
        gap:11px;
    }

    .jl2-mini-icon{
        font-size:25px;
    }

    .jl2-mini-info{
        flex:1;
    }

    .jl2-mini-info strong{
        display:block;
        color:var(--text,#172033);
    }

    .jl2-mini-info span{
        display:block;
        color:var(--muted,#718096);
        font-size:12px;
        margin-top:2px;
    }

    .jl2-mini-percent{
        font-weight:800;
        font-size:13px;
        color:var(--primary,#4f46e5);
    }

    .jl2-mini-bar{
        height:7px;
        background:#e5e7eb;
        border-radius:20px;
        overflow:hidden;
        margin-top:12px;
    }

    .jl2-mini-fill{
        height:100%;
        width:0;
        background:var(--primary,#4f46e5);
        border-radius:20px;
        transition:width .5s ease;
    }

    .jl2-empty{
        text-align:center;
        padding:22px;
        color:var(--muted,#718096);
        font-size:14px;
    }

    .jl2-complete{
        color:#16a34a;
        font-weight:700;
    }

    body.dark .jl2-daily-bar,
    body.dark .jl2-mini-bar{
        background:#30364a;
    }

    body.dark .jl2-stat-value,
    body.dark .jl2-daily-title,
    body.dark .jl2-next-info strong,
    body.dark .jl2-mini-info strong,
    body.dark .jl2-section-title{
        color:#fff;
    }

    `;


    document.head.appendChild(
        style
    );

}


/* ============================================================
   4. TABLEAU DE NIVEAU
   ============================================================ */

function JL2_renderLevelCard(){

    const home =
        JL2_getElement("home");


    if(!home){

        return;

    }


    let container =
        JL2_getElement(
            "jl2LevelContainer"
        );


    if(!container){

        container =
            document.createElement("div");

        container.id =
            "jl2LevelContainer";


        const firstChild =
            home.firstElementChild;


        if(firstChild){

            home.insertBefore(
                container,
                firstChild
            );

        }else{

            home.appendChild(
                container
            );

        }

    }


    const info =
        getLevelInfo();


    const levelConfig =
        JL2.levels[
            info.level
        ];


    let nextText =
        "Niveau maximum atteint";


    if(info.nextLevel){

        nextText =
            "Encore " +
            info.remaining +
            " XP pour " +
            info.nextLevel;

    }


    container.innerHTML = `

        <div class="jl2-level-card">

            <div class="jl2-level-top">

                <div class="jl2-level-icon">
                    ${levelConfig.icon}
                </div>

                <div class="jl2-level-title">

                    <strong>
                        ${escapeHTML(
                            levelConfig.name
                        )}
                    </strong>

                    <span>
                        Ton niveau actuel
                    </span>

                </div>

                <div class="jl2-xp-number">
                    ${info.xp} XP
                </div>

            </div>

            <div class="jl2-progress">

                <div
                    class="jl2-progress-fill"
                    style="width:${info.percent}%"
                ></div>

            </div>

            <div class="jl2-next">
                ${nextText}
            </div>

        </div>

    `;

}


/* ============================================================
   5. STATISTIQUES
   ============================================================ */

function JL2_renderStats(){

    const home =
        JL2_getElement("home");


    if(!home){

        return;

    }


    let container =
        JL2_getElement(
            "jl2StatsContainer"
        );


    if(!container){

        container =
            document.createElement("div");

        container.id =
            "jl2StatsContainer";


        home.appendChild(
            container
        );

    }


    const stats =
        getStatistics();


    container.innerHTML = `

        <div class="jl2-stats-grid">

            <div class="jl2-stat">

                <div class="jl2-stat-icon">
                    ⭐
                </div>

                <div class="jl2-stat-value">
                    ${stats.xp}
                </div>

                <div class="jl2-stat-label">
                    XP total
                </div>

            </div>


            <div class="jl2-stat">

                <div class="jl2-stat-icon">
                    🪙
                </div>

                <div class="jl2-stat-value">
                    ${stats.coins}
                </div>

                <div class="jl2-stat-label">
                    Pièces
                </div>

            </div>


            <div class="jl2-stat">

                <div class="jl2-stat-icon">
                    🔥
                </div>

                <div class="jl2-stat-value">
                    ${stats.streak}
                </div>

                <div class="jl2-stat-label">
                    Jours de série
                </div>

            </div>


            <div class="jl2-stat">

                <div class="jl2-stat-icon">
                    🎯
                </div>

                <div class="jl2-stat-value">
                    ${stats.accuracy}%
                </div>

                <div class="jl2-stat-label">
                    Précision quiz
                </div>

            </div>

        </div>

    `;

}


/* ============================================================
   6. OBJECTIF QUOTIDIEN
   ============================================================ */

function JL2_renderDaily(){

    const home =
        JL2_getElement("home");


    if(!home){

        return;

    }


    let container =
        JL2_getElement(
            "jl2DailyContainer"
        );


    if(!container){

        container =
            document.createElement("div");

        container.id =
            "jl2DailyContainer";

        home.appendChild(
            container
        );

    }


    const daily =
        getDailyProgress();


    const message =
        daily.completed

            ? "🎉 Objectif quotidien terminé !"

            : daily.xp +
              " / " +
              daily.goal +
              " XP";


    container.innerHTML = `

        <div class="jl2-daily">

            <div class="jl2-daily-head">

                <div class="jl2-daily-title">
                    🎯 Objectif du jour
                </div>

                <div class="jl2-daily-value">
                    ${daily.percent}%
                </div>

            </div>

            <div class="jl2-daily-bar">

                <div
                    class="jl2-daily-fill"
                    style="width:${daily.percent}%"
                ></div>

            </div>

            <div
                class="${
                    daily.completed
                    ? "jl2-daily-complete"
                    : ""
                }"
            >
                ${message}
            </div>

        </div>

    `;

}


/* ============================================================
   7. PROCHAINE LEÇON
   ============================================================ */

function JL2_renderNextLesson(){

    const home =
        JL2_getElement("home");


    if(!home){

        return;

    }


    let container =
        JL2_getElement(
            "jl2NextLessonContainer"
        );


    if(!container){

        container =
            document.createElement("div");

        container.id =
            "jl2NextLessonContainer";

        home.appendChild(
            container
        );

    }


    const lesson =
        findNextLesson();


    if(!lesson){

        container.innerHTML = `

            <div class="jl2-next-card">

                <div class="jl2-next-icon">
                    🏆
                </div>

                <div class="jl2-next-info">

                    <strong>
                        Toutes les leçons terminées !
                    </strong>

                    <span>
                        Félicitations, continue à pratiquer.
                    </span>

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="jl2-next-card">

            <div class="jl2-next-icon">
                📖
            </div>

            <div class="jl2-next-info">

                <strong>
                    ${escapeHTML(
                        lesson.title
                    )}
                </strong>

                <span>
                    ${lesson.level}
                    • Leçon ${lesson.number || ""}
                </span>

            </div>

            <button
                class="jl2-next-button"
                id="jl2NextButton"
            >
                Continuer
            </button>

        </div>

    `;


    const button =
        document.getElementById(
            "jl2NextButton"
        );


    if(button){

        button.onclick =
            function(){

                JL2_openLesson(
                    lesson
                );

            };

    }

}


/* ============================================================
   8. NIVEAUX A1 A2 B1
   ============================================================ */

function JL2_renderLevels(){

    const home =
        JL2_getElement("home");


    if(!home){

        return;

    }


    let container =
        JL2_getElement(
            "jl2LevelsContainer"
        );


    if(!container){

        container =
            document.createElement("div");

        container.id =
            "jl2LevelsContainer";

        home.appendChild(
            container
        );

    }


    const levels =
        ["A1","A2","B1"];


    let html = `

        <div class="jl2-section-title">
            📚 Progression par niveau
        </div>

        <div class="jl2-level-list">
    `;


    levels.forEach(

        function(level){

            const config =
                JL2.levels[level];


            const progress =
                getLevelProgress(
                    level
                );


            html += `

                <div class="jl2-mini-level">

                    <div class="jl2-mini-top">

                        <div class="jl2-mini-icon">
                            ${config.icon}
                        </div>

                        <div class="jl2-mini-info">

                            <strong>
                                ${config.name}
                            </strong>

                            <span>
                                ${progress.completed}
                                /
                                ${progress.total}
                                leçons
                            </span>

                        </div>

                        <div class="jl2-mini-percent">
                            ${progress.percent}%
                        </div>

                    </div>

                    <div class="jl2-mini-bar">

                        <div
                            class="jl2-mini-fill"
                            style="width:${progress.percent}%"
                        ></div>

                    </div>

                </div>

            `;

        }

    );


    html += `
        </div>
    `;


    container.innerHTML =
        html;

}


/* ============================================================
   9. OUVRIR UNE LEÇON
   ============================================================ */

function JL2_openLesson(lesson){

    if(!lesson){

        return;

    }


    try{

        if(
            typeof openLesson ===
            "function"
        ){

            openLesson(
                lesson.id
            );

            return;

        }

    }catch(error){

        console.warn(error);

    }


    try{

        if(
            typeof showPage ===
            "function"
        ){

            showPage(
                "lessonPage"
            );

        }

    }catch(error){

        console.warn(error);

    }

}


/* ============================================================
   10. RENDU GLOBAL DE L'INTERFACE
   ============================================================ */

function JL2_renderInterface(){

    JL2_addStyles();

    JL2_renderLevelCard();

    JL2_renderStats();

    JL2_renderDaily();

    JL2_renderNextLesson();

    JL2_renderLevels();

}


/* ============================================================
   PARTIE 3 TERMINÉE
   ============================================================
   *//* ============================================================
   JoLearn 2.0 — PARTIE 4/6
   TABLEAU DE BORD • OBJECTIFS • PROGRESSION
   ============================================================ */


/* ============================================================
   1. METTRE À JOUR LES INFORMATIONS EXISTANTES
   ============================================================ */

function JL2_updateExistingDashboard(){

    const s =
        getState();


    if(!s){

        return;

    }


    const stats =
        getStatistics();


    const level =
        getLevelInfo();


    const daily =
        getDailyProgress();


    const xp =
        JL2_getElement(
            "homeXP"
        );


    if(xp){

        xp.textContent =
            stats.xp;

    }


    const coins =
        JL2_getElement(
            "homeCoins"
        );


    if(coins){

        coins.textContent =
            stats.coins;

    }


    const streak =
        JL2_getElement(
            "homeStreak"
        );


    if(streak){

        streak.textContent =
            stats.streak;

    }


    const dailyText =
        JL2_getElement(
            "dailyText"
        );


    if(dailyText){

        dailyText.textContent =
            daily.xp +
            " / " +
            daily.goal +
            " XP";

    }


    const dailyProgress =
        JL2_getElement(
            "dailyProgress"
        );


    if(dailyProgress){

        dailyProgress.style.width =
            daily.percent +
            "%";

    }


    const homeLevel =
        JL2_getElement(
            "homeLevel"
        );


    if(homeLevel){

        homeLevel.textContent =
            level.name;

    }


    const profileLevel =
        JL2_getElement(
            "profileLevel"
        );


    if(profileLevel){

        profileLevel.textContent =
            level.name;

    }


    const profileName =
        JL2_getElement(
            "profileName"
        );


    if(
        profileName &&
        s.name
    ){

        profileName.textContent =
            s.name;

    }


    const greeting =
        JL2_getElement(
            "homeGreeting"
        );


    if(greeting){

        greeting.textContent =
            "Bonjour " +
            (s.name || "Joseph") +
            " 👋";

    }

}


/* ============================================================
   2. BARRE DE PROGRESSION PRINCIPALE
   ============================================================ */

function JL2_updateGlobalProgress(){

    const progress =
        getGlobalProgress();


    const bars =
        document.querySelectorAll(
            "[data-jl2-global-progress]"
        );


    bars.forEach(

        function(bar){

            bar.style.width =
                progress + "%";

        }

    );


    const values =
        document.querySelectorAll(
            "[data-jl2-global-value]"
        );


    values.forEach(

        function(element){

            element.textContent =
                progress + "%";

        }

    );

}


/* ============================================================
   3. OBJECTIF QUOTIDIEN DANS L'ANCIENNE INTERFACE
   ============================================================ */

function JL2_updateDailyExisting(){

    const daily =
        getDailyProgress();


    const text =
        JL2_getElement(
            "dailyText"
        );


    if(text){

        text.textContent =
            daily.xp +
            " / " +
            daily.goal +
            " XP";

    }


    const progress =
        JL2_getElement(
            "dailyProgress"
        );


    if(progress){

        progress.style.width =
            daily.percent +
            "%";

    }


    const button =
        JL2_getElement(
            "dailyRewardBtn"
        );


    if(button){

        if(daily.completed){

            button.disabled =
                false;

            button.textContent =
                "🎁 Récupérer";

        }else{

            button.disabled =
                false;

            button.textContent =
                "🎁 Récompense";

        }

    }

}


/* ============================================================
   4. CLIQUER SUR LA RÉCOMPENSE
   ============================================================ */

function JL2_bindDailyReward(){

    const button =
        JL2_getElement(
            "dailyRewardBtn"
        );


    if(
        !button ||
        button.dataset.jl2Bound === "1"
    ){

        return;

    }


    button.dataset.jl2Bound =
        "1";


    button.addEventListener(

        "click",

        function(){

            claimDailyReward();

            JL2_refreshUI();

        }

    );

}


/* ============================================================
   5. XP NÉCESSAIRE
   ============================================================ */

function JL2_getProgressText(){

    const info =
        getLevelInfo();


    if(!info.nextLevel){

        return (
            info.xp +
            " XP • Niveau maximum"
        );

    }


    return (
        info.xp +
        " / " +
        info.nextXP +
        " XP"
    );

}


/* ============================================================
   6. CRÉER UN RÉSUMÉ RAPIDE
   ============================================================ */

function JL2_renderQuickSummary(){

    const profile =
        JL2_getElement(
            "profile"
        );


    if(!profile){

        return;

    }


    let container =
        JL2_getElement(
            "jl2ProfileSummary"
        );


    if(!container){

        container =
            document.createElement("div");

        container.id =
            "jl2ProfileSummary";


        profile.appendChild(
            container
        );

    }


    const stats =
        getStatistics();


    const info =
        getLevelInfo();


    container.innerHTML = `

        <div class="jl2-card">

            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:14px;
                "
            >

                <div
                    style="
                        width:58px;
                        height:58px;
                        border-radius:18px;
                        background:#eef2ff;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:30px;
                    "
                >
                    ${info.icon}
                </div>

                <div style="flex:1">

                    <strong
                        style="
                            display:block;
                            font-size:18px;
                        "
                    >
                        ${info.name}
                    </strong>

                    <span
                        style="
                            display:block;
                            margin-top:4px;
                            color:var(--muted);
                            font-size:13px;
                        "
                    >
                        ${JL2_getProgressText()}
                    </span>

                </div>

            </div>


            <div
                style="
                    display:grid;
                    grid-template-columns:
                    repeat(3,1fr);
                    gap:8px;
                    margin-top:15px;
                    text-align:center;
                "
            >

                <div>

                    <strong>
                        ${stats.completed}
                    </strong>

                    <small
                        style="
                            display:block;
                            color:var(--muted);
                        "
                    >
                        Leçons
                    </small>

                </div>


                <div>

                    <strong>
                        ${stats.quizCorrect}
                    </strong>

                    <small
                        style="
                            display:block;
                            color:var(--muted);
                        "
                    >
                        Bonnes réponses
                    </small>

                </div>


                <div>

                    <strong>
                        ${stats.progress}%
                    </strong>

                    <small
                        style="
                            display:block;
                            color:var(--muted);
                        "
                    >
                        Progression
                    </small>

                </div>

            </div>

        </div>

    `;

}


/* ============================================================
   7. MESSAGE DE MOTIVATION
   ============================================================ */

function JL2_getMotivation(){

    const stats =
        getStatistics();


    const daily =
        getDailyProgress();


    if(daily.completed){

        return "🔥 Excellent ! Ton objectif du jour est atteint.";

    }


    if(stats.streak >= 7){

        return "🚀 Une semaine de série ! Continue comme ça.";

    }


    if(stats.streak >= 3){

        return "🔥 Tu construis une belle série !";

    }


    if(stats.completed === 0){

        return "🌱 Commence ta première leçon aujourd'hui.";

    }


    if(stats.accuracy >= 90){

        return "🧠 Ta précision est excellente !";

    }


    if(stats.xp >= 500){

        return "⚡ Tu progresses très bien !";

    }


    return "💪 Continue à apprendre un peu chaque jour.";

}


/* ============================================================
   8. AFFICHER MOTIVATION
   ============================================================ */

function JL2_renderMotivation(){

    const home =
        JL2_getElement(
            "home"
        );


    if(!home){

        return;

    }


    let container =
        JL2_getElement(
            "jl2Motivation"
        );


    if(!container){

        container =
            document.createElement("div");

        container.id =
            "jl2Motivation";

        home.appendChild(
            container
        );

    }


    container.innerHTML = `

        <div
            class="jl2-card"
            style="
                text-align:center;
                font-weight:700;
                line-height:1.5;
            "
        >
            ${JL2_getMotivation()}
        </div>

    `;

}


/* ============================================================
   9. RAFRAÎCHIR TOUTE L'INTERFACE 2.0
   ============================================================ */

function JL2_refreshUI(){

    try{

        dailyCheck();

    }catch(error){

        console.warn(error);

    }


    try{

        repairState();

    }catch(error){

        console.warn(error);

    }


    try{

        checkBadges();

    }catch(error){

        console.warn(error);

    }


    try{

        checkDailyGoal();

    }catch(error){

        console.warn(error);

    }


    JL2_updateExistingDashboard();

    JL2_updateGlobalProgress();

    JL2_updateDailyExisting();

    JL2_renderInterface();

    JL2_renderQuickSummary();

    JL2_renderMotivation();

    JL2_bindDailyReward();

}


/* ============================================================
   10. RÉCOMPENSER UNE LEÇON TERMINÉE
   ============================================================ */

function JL2_completeLesson(lessonId){

    const s =
        getState();


    if(!s){

        return;

    }


    if(
        !Array.isArray(
            s.completed
        )
    ){

        s.completed = [];

    }


    if(
        s.completed.includes(
            lessonId
        )
    ){

        return;

    }


    s.completed.push(
        lessonId
    );


    save();


    rewardLesson();


    showToast(
        "📚 Leçon terminée ! +10 XP +2 pièces"
    );


    JL2_refreshUI();

}


/* ============================================================
   11. RÉCOMPENSE DE FIN DE QUIZ
   ============================================================ */

function JL2_finishQuiz(correct,total){

    const s =
        getState();


    if(!s){

        return;

    }


    correct =
        Math.max(
            0,
            safeNumber(
                correct,
                0
            )
        );


    total =
        Math.max(
            0,
            safeNumber(
                total,
                0
            )
        );


    s.quizTotal =
        safeNumber(
            s.quizTotal,
            0
        ) + total;


    s.quizCorrect =
        safeNumber(
            s.quizCorrect,
            0
        ) + correct;


    const percent =
        total > 0
            ? Math.round(
                correct /
                total *
                100
            )
            : 0;


    if(
        percent >
        safeNumber(
            s.quizBest,
            0
        )
    ){

        s.quizBest =
            percent;

    }


    save();


    for(
        let i = 0;
        i < correct;
        i++
    ){

        rewardQuiz(true);

    }


    for(
        let i = 0;
        i <
        Math.max(
            0,
            total - correct
        );
        i++
    ){

        rewardQuiz(false);

    }


    checkBadges();


    if(percent >= 90){

        showToast(
            "🧠 Excellent quiz : " +
            percent +
            "% !"
        );

    }else{

        showToast(
            "🎯 Quiz terminé : " +
            percent +
            "%"
        );

    }


    JL2_refreshUI();

}


/* ============================================================
   PARTIE 4 TERMINÉE
   ============================================================ 
   *//* ============================================================
   JoLearn 2.0 — PARTIE 5/6
   BADGES • NOTIFICATIONS • INTERACTIONS
   ============================================================ */


/* ============================================================
   1. CONTENEUR DES NOTIFICATIONS
   ============================================================ */

function JL2_notificationContainer(){

    let container =
        document.getElementById(
            "jl2Notifications"
        );


    if(container){

        return container;

    }


    container =
        document.createElement("div");


    container.id =
        "jl2Notifications";


    container.style.cssText = `

        position:fixed;
        top:18px;
        left:50%;
        transform:translateX(-50%);
        width:min(
            calc(100% - 30px),
            430px
        );
        z-index:99999;
        pointer-events:none;

    `;


    document.body.appendChild(
        container
    );


    return container;

}


/* ============================================================
   2. NOTIFICATION JoLearn 2.0
   ============================================================ */

function JL2_notify(message,type){

    const container =
        JL2_notificationContainer();


    const notification =
        document.createElement("div");


    notification.style.cssText = `

        background:var(--card,#fff);
        color:var(--text,#172033);
        border:1px solid var(--border,#e5e7eb);
        border-radius:16px;
        padding:14px 16px;
        margin-bottom:9px;
        box-shadow:0 10px 35px rgba(0,0,0,.15);
        font-size:14px;
        font-weight:700;
        transform:translateY(-15px);
        opacity:0;
        transition:
            transform .25s ease,
            opacity .25s ease;

    `;


    if(type === "success"){

        notification.style.borderLeft =
            "4px solid #16a34a";

    }else if(type === "warning"){

        notification.style.borderLeft =
            "4px solid #f59e0b";

    }else{

        notification.style.borderLeft =
            "4px solid #4f46e5";

    }


    notification.textContent =
        message;


    container.appendChild(
        notification
    );


    requestAnimationFrame(

        function(){

            notification.style.transform =
                "translateY(0)";

            notification.style.opacity =
                "1";

        }

    );


    setTimeout(

        function(){

            notification.style.opacity =
                "0";

            notification.style.transform =
                "translateY(-15px)";


            setTimeout(

                function(){

                    notification.remove();

                },

                300

            );

        },

        2600

    );

}


/* ============================================================
   3. AFFICHER LES BADGES
   ============================================================ */

function JL2_renderBadges(){

    const container =
        JL2_getElement(
            "badgesContainer"
        );


    if(!container){

        return;

    }


    const badges =
        getAdvancedBadges();


    const s =
        getState();


    const unlocked =
        s &&
        Array.isArray(
            s.badges
        )
            ? s.badges
            : [];


    let html = "";


    badges.forEach(

        function(badge){

            const active =
                unlocked.includes(
                    badge.id
                );


            html += `

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                        padding:13px;
                        margin-bottom:9px;
                        border-radius:16px;
                        border:1px solid
                            var(--border);
                        background:
                            var(--card);
                        opacity:
                            ${active ? "1" : ".45"};
                    "
                >

                    <div
                        style="
                            width:46px;
                            height:46px;
                            border-radius:14px;
                            background:
                                ${active
                                    ? "#eef2ff"
                                    : "#f1f5f9"};
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:24px;
                            flex-shrink:0;
                        "
                    >
                        ${badge.icon}
                    </div>

                    <div style="flex:1">

                        <strong
                            style="
                                display:block;
                                color:var(--text);
                            "
                        >
                            ${escapeHTML(
                                badge.title
                            )}
                        </strong>

                        <span
                            style="
                                display:block;
                                color:var(--muted);
                                font-size:12px;
                                margin-top:3px;
                            "
                        >
                            ${escapeHTML(
                                badge.description
                            )}
                        </span>

                    </div>

                    <div
                        style="
                            font-size:18px;
                        "
                    >
                        ${
                            active
                            ? "✅"
                            : "🔒"
                        }
                    </div>

                </div>

            `;

        }

    );


    if(!html){

        html = `
            <div class="jl2-empty">
                Aucun badge disponible.
            </div>
        `;

    }


    container.innerHTML =
        html;

}


/* ============================================================
   4. SHOP / RÉCOMPENSES
   ============================================================ */

function JL2_renderRewardSummary(){

    const container =
        JL2_getElement(
            "rewards"
        );


    if(!container){

        return;

    }


    let summary =
        document.getElementById(
            "jl2RewardSummary"
        );


    if(!summary){

        summary =
            document.createElement("div");

        summary.id =
            "jl2RewardSummary";


        container.insertBefore(
            summary,
            container.firstChild
        );

    }


    const stats =
        getStatistics();


    summary.innerHTML = `

        <div class="jl2-card">

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <div>

                    <strong
                        style="
                            font-size:18px;
                        "
                    >
                        🪙 Tes pièces
                    </strong>

                    <div
                        style="
                            color:var(--muted);
                            font-size:12px;
                            margin-top:4px;
                        "
                    >
                        Utilise-les dans les récompenses.
                    </div>

                </div>

                <div
                    style="
                        font-size:24px;
                        font-weight:800;
                    "
                >
                    ${stats.coins} 🪙
                </div>

            </div>

        </div>

    `;

}


/* ============================================================
   5. PROGRESSION DU PROFIL
   ============================================================ */

function JL2_renderProfileStats(){

    const container =
        JL2_getElement(
            "profileStats"
        );


    if(!container){

        return;

    }


    const stats =
        getStatistics();


    const level =
        getLevelInfo();


    container.innerHTML = `

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(2,1fr);
                gap:10px;
            "
        >

            <div class="jl2-card">

                <strong>
                    ${stats.completed}
                </strong>

                <div
                    style="
                        color:var(--muted);
                        font-size:12px;
                    "
                >
                    Leçons terminées
                </div>

            </div>


            <div class="jl2-card">

                <strong>
                    ${stats.xp}
                </strong>

                <div
                    style="
                        color:var(--muted);
                        font-size:12px;
                    "
                >
                    XP
                </div>

            </div>


            <div class="jl2-card">

                <strong>
                    ${stats.streak}
                </strong>

                <div
                    style="
                        color:var(--muted);
                        font-size:12px;
                    "
                >
                    Jours
                </div>

            </div>


            <div class="jl2-card">

                <strong>
                    ${stats.accuracy}%
                </strong>

                <div
                    style="
                        color:var(--muted);
                        font-size:12px;
                    "
                >
                    Quiz
                </div>

            </div>

        </div>


        <div class="jl2-card">

            <strong>
                ${level.icon}
                ${level.name}
            </strong>

            <div
                style="
                    margin-top:10px;
                    height:9px;
                    background:#e5e7eb;
                    border-radius:20px;
                    overflow:hidden;
                "
            >

                <div
                    style="
                        width:${level.percent}%;
                        height:100%;
                        background:
                            var(--primary);
                        border-radius:20px;
                    "
                ></div>

            </div>

        </div>

    `;

}


/* ============================================================
   6. DÉTECTION DES CHANGEMENTS DE NIVEAU
   ============================================================ */

function JL2_checkLevelChange(){

    const s =
        getState();


    if(!s){

        return;

    }


    const current =
        getXPLevel(
            s.xp
        );


    const key =
        "jolearn2_last_level";


    const previous =
        localStorage.getItem(
            key
        );


    if(!previous){

        localStorage.setItem(
            key,
            current
        );

        return;

    }


    if(
        previous !== current
    ){

        localStorage.setItem(
            key,
            current
        );


        JL2_notify(
            "🎉 Félicitations ! Tu es maintenant " +
            JL2.levels[current].name,
            "success"
        );

    }

}


/* ============================================================
   7. ÉVÉNEMENT D'OUVERTURE DES COURS
   ============================================================ */

function JL2_bindCourseNavigation(){

    const buttons =
        document.querySelectorAll(
            "[data-level]"
        );


    buttons.forEach(

        function(button){

            if(
                button.dataset.jl2Bound === "1"
            ){

                return;

            }


            button.dataset.jl2Bound =
                "1";


            button.addEventListener(

                "click",

                function(){

                    const level =
                        button.dataset.level;


                    if(
                        !level
                    ){

                        return;

                    }


                    const container =
                        JL2_getElement(
                            "lessonsContainer"
                        );


                    if(container){

                        container.scrollIntoView({
                            behavior:"smooth",
                            block:"start"
                        });

                    }

                }

            );

        }

    );

}


/* ============================================================
   8. SURVEILLER LES CHANGEMENTS DU LOCALSTORAGE
   ============================================================ */

function JL2_storageListener(){

    window.addEventListener(

        "storage",

        function(event){

            if(
                event.key === null ||
                event.key ===
                "jolearn_state"
            ){

                setTimeout(

                    function(){

                        JL2_refreshUI();

                    },

                    100

                );

            }

        }

    );

}


/* ============================================================
   9. EMPÊCHER LES CLICS RAPIDES MULTIPLES
   ============================================================ */

function JL2_preventDoubleClick(){

    document.addEventListener(

        "click",

        function(event){

            const button =
                event.target.closest(
                    "button"
                );


            if(!button){

                return;

            }


            if(
                button.dataset.jl2Lock ===
                "1"
            ){

                event.preventDefault();

                return;

            }


            if(
                button.dataset.jl2TemporaryLock ===
                "1"
            ){

                button.dataset.jl2Lock =
                    "1";


                setTimeout(

                    function(){

                        delete button.dataset
                            .jl2Lock;

                    },

                    500

                );

            }

        }

    );

}


/* ============================================================
   10. BOUTON "CONTINUER"
   ============================================================ */

function JL2_bindContinueButtons(){

    document.addEventListener(

        "click",

        function(event){

            const button =
                event.target.closest(
                    "[data-jl2-continue]"
                );


            if(!button){

                return;

            }


            const lessonId =
                button.dataset.jl2Continue;


            if(!lessonId){

                return;

            }


            const list =
                getLessons();


            const lesson =
                list.find(

                    item =>
                        item.id ===
                        lessonId

                );


            if(lesson){

                JL2_openLesson(
                    lesson
                );

            }

        }

    );

}


/* ============================================================
   11. BADGES + NOTIFICATION
   ============================================================ */

function JL2_checkAndNotifyBadges(){

    const s =
        getState();


    if(!s){

        return;

    }


    const before =
        Array.isArray(
            s.badges
        )
            ? [...s.badges]
            : [];


    checkBadges();


    const after =
        Array.isArray(
            s.badges
        )
            ? s.badges
            : [];


    after.forEach(

        function(id){

            if(
                !before.includes(id)
            ){

                const badge =
                    getAdvancedBadges()
                        .find(
                            item =>
                                item.id === id
                        );


                if(badge){

                    JL2_notify(
                        "🏆 Badge débloqué : " +
                        badge.title,
                        "success"
                    );

                }

            }

        }

    );

}


/* ============================================================
   12. RAFRAÎCHISSEMENT RÉCOMPENSES
   ============================================================ */

function JL2_refreshRewards(){

    JL2_renderBadges();

    JL2_renderRewardSummary();

    JL2_renderProfileStats();

}


/* ============================================================
   13. RAFRAÎCHISSEMENT COMPLET
   ============================================================ */

function JL2_fullRefresh(){

    JL2_refreshUI();

    JL2_refreshRewards();

    JL2_checkLevelChange();

    JL2_checkAndNotifyBadges();

    JL2_bindCourseNavigation();

}


/* ============================================================
   PARTIE 5 TERMINÉE
   ============================================================
   *//* ============================================================
   JoLearn 2.0 — PARTIE 6/6
   SAUVEGARDE • INITIALISATION • DÉMARRAGE
   ============================================================ */


/* ============================================================
   1. SAUVEGARDE DE SÉCURITÉ
   ============================================================ */

function JL2_backup(){

    const s =
        getState();


    if(!s){

        return;

    }


    try{

        localStorage.setItem(

            "jolearn2_backup",

            JSON.stringify({

                date:
                    Date.now(),

                state:
                    s

            })

        );

    }catch(error){

        console.warn(
            "JoLearn 2.0 : backup impossible.",
            error
        );

    }

}


/* ============================================================
   2. RESTAURER UN BACKUP
   ============================================================ */

function JL2_restoreBackup(){

    try{

        const raw =
            localStorage.getItem(
                "jolearn2_backup"
            );


        if(!raw){

            return false;

        }


        const backup =
            JSON.parse(raw);


        if(
            !backup ||
            !backup.state
        ){

            return false;

        }


        const s =
            getState();


        if(!s){

            return false;

        }


        Object.assign(
            s,
            backup.state
        );


        save();


        JL2_fullRefresh();


        return true;

    }catch(error){

        console.warn(
            "JoLearn 2.0 : restauration impossible.",
            error
        );

        return false;

    }

}


/* ============================================================
   3. NETTOYAGE AUTOMATIQUE
   ============================================================ */

function JL2_cleanup(){

    try{

        repairState();

    }catch(error){

        console.warn(error);

    }


    try{

        dailyCheck();

    }catch(error){

        console.warn(error);

    }


    try{

        checkBadges();

    }catch(error){

        console.warn(error);

    }


    try{

        checkDailyGoal();

    }catch(error){

        console.warn(error);

    }

}


/* ============================================================
   4. INITIALISATION
   ============================================================ */

function JL2_init(){

    if(
        JL2.initialized
    ){

        return;

    }


    JL2.initialized =
        true;


    console.log(
        "🚀 JoLearn 2.0 démarrage..."
    );


    try{

        loadEngineData();

    }catch(error){

        console.warn(error);

    }


    JL2_cleanup();


    JL2_addStyles();


    JL2_fullRefresh();


    JL2_storageListener();


    JL2_preventDoubleClick();


    JL2_bindContinueButtons();


    JL2_bindCourseNavigation();


    JL2_backup();


    setTimeout(

        function(){

            JL2_fullRefresh();

        },

        500

    );


    console.log(
        "✅ JoLearn 2.0 activé."
    );

}


/* ============================================================
   5. DÉMARRAGE DOM
   ============================================================ */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(

        "DOMContentLoaded",

        function(){

            JL2_init();

        }

    );

}else{

    JL2_init();

}


/* ============================================================
   6. SAUVEGARDE AVANT FERMETURE
   ============================================================ */

window.addEventListener(

    "beforeunload",

    function(){

        try{

            save();

            saveEngineData();

            JL2_backup();

        }catch(error){

            console.warn(error);

        }

    }

);


/* ============================================================
   7. SAUVEGARDE PÉRIODIQUE
   ============================================================ */

setInterval(

    function(){

        try{

            save();

            saveEngineData();

            JL2_backup();

        }catch(error){

            console.warn(error);

        }

    },

    60000

);


/* ============================================================
   8. API FINALE
   ============================================================ */

window.JoLearn2 = Object.assign(

    window.JoLearn2 || {},

    {

        version:
            JL2.version,

        init:
            JL2_init,

        refresh:
            JL2_fullRefresh,

        backup:
            JL2_backup,

        restoreBackup:
            JL2_restoreBackup,

        completeLesson:
            JL2_completeLesson,

        finishQuiz:
            JL2_finishQuiz,

        getMotivation:
            JL2_getMotivation,

        getProgressText:
            JL2_getProgressText

    }

);


/* ============================================================
   9. MESSAGE CONSOLE
   ============================================================ */

console.log(
    "🎓 JoLearn 2.0 — moteur complet chargé."
);


/* ============================================================
   FIN JoLearn 2.0
   ============================================================ */
