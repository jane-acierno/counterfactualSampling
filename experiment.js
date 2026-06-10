// DEFINE GLOBAL VARIABLES
let timeline = [];

// jsPsych Initialization
const jsPsych = initJsPsych({
  use_webaudio: false,
  display_element: 'jspsych-target',
  show_progress_bar: true,
  default_iti: 0,
  on_finish: function (data) {
    jsPsych.data.displayData('csv');
  }
});

const participantId = jsPsych.data.getURLVariable('PROLIFIC_PID');
const studyId = jsPsych.data.getURLVariable('STUDY_ID');
const sessionId = jsPsych.data.getURLVariable('SESSION_ID');

// Random assignment of manipulations
const expcondition = jsPsych.randomization.sampleWithoutReplacement(['treatment', 'control'], 1)[0];

// 8 claims — all used every session, presented in shuffled order
const claims = [
  `Electrical grid failure`,
  `Air traffic control error`,
  `Dam monitoring failure`,
  `Drinking water contamination`,
  `Emergency alert system failure`,
  `Hospital network cyberattack`,
  `Railroad signal failure`,
  `Nuclear plant monitoring error`
];

// Shuffle the order of claims for each participant
const trials = jsPsych.randomization.shuffle([0, 1, 2, 3, 4, 5, 6, 7]);

// Per-claim scenario text.
// headline(senator): full news story shown before pre-rating, with senator piped in.
// setupOnly: the same story shown after sampling, with the politician reference removed
//            so the post-rating is not anchored to the senator attribution.
const claimScenarios = [
  // 0 — Electrical grid failure
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        Federal officials reported that a software malfunction temporarily disrupted monitoring
        systems used to manage portions of the nation's electrical grid. Operators identified
        the problem and restored normal functionality before any power outages occurred.
        Several weeks earlier, <strong>${senator}</strong>, chair of a Senate oversight committee
        responsible for infrastructure preparedness, had publicly stated that existing safeguards
        were sufficient to prevent major disruptions. Following the incident, <strong>${senator}</strong>
        called for an investigation into what happened.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        Federal officials reported that a software malfunction temporarily disrupted monitoring
        systems used to manage portions of the nation's electrical grid. Operators identified
        the problem and restored normal functionality before any power outages occurred.
        Following the incident, a Senate oversight committee called for an investigation
        into what happened.
      </p>`
  },
  // 1 — Air traffic control error
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        Federal aviation authorities reported that a software glitch caused a brief lapse in
        radar coverage at a major air traffic control facility, forcing controllers to rely on
        backup procedures for approximately 20 minutes. No aircraft were in danger and all
        flights landed safely. Several weeks earlier, <strong>${senator}</strong>, chair of a
        Senate aviation oversight subcommittee, had stated publicly that the nation's air
        traffic control infrastructure was adequately maintained and posed no safety risk.
        Following the incident, <strong>${senator}</strong> announced plans to convene an
        emergency hearing on aviation system reliability.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        Federal aviation authorities reported that a software glitch caused a brief lapse in
        radar coverage at a major air traffic control facility, forcing controllers to rely on
        backup procedures for approximately 20 minutes. No aircraft were in danger and all
        flights landed safely. Following the incident, the Senate aviation oversight
        subcommittee announced plans to convene an emergency hearing on aviation system
        reliability.
      </p>`
  },
  // 2 — Dam monitoring failure
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        The Army Corps of Engineers reported that sensor equipment used to monitor water
        pressure and structural stress at a large federally managed dam malfunctioned for
        several hours before engineers noticed and switched to manual monitoring. Water
        levels remained stable throughout the incident. Several weeks earlier,
        <strong>${senator}</strong>, chair of a Senate subcommittee on water infrastructure,
        had said that federal dam monitoring systems met all current safety standards.
        Following the incident, <strong>${senator}</strong> requested a full audit of
        monitoring equipment at federally managed dams nationwide.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        The Army Corps of Engineers reported that sensor equipment used to monitor water
        pressure and structural stress at a large federally managed dam malfunctioned for
        several hours before engineers noticed and switched to manual monitoring. Water
        levels remained stable throughout the incident. Following the incident, the Senate
        subcommittee on water infrastructure requested a full audit of monitoring equipment
        at federally managed dams nationwide.
      </p>`
  },
  // 3 — Drinking water contamination
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        The EPA announced that routine testing detected elevated levels of a chemical
        byproduct in the drinking water supply of a mid-sized city, triggering a precautionary
        advisory for residents to use bottled water while treatment facilities were inspected.
        Officials said the contamination did not exceed federal action thresholds and was
        resolved within 48 hours. Several weeks earlier, <strong>${senator}</strong>, chair of
        the Senate Environment and Public Works Committee, had publicly defended the current
        federal framework for municipal water safety as robust and sufficient. Following the
        advisory, <strong>${senator}</strong> called for updated water testing protocols.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        The EPA announced that routine testing detected elevated levels of a chemical
        byproduct in the drinking water supply of a mid-sized city, triggering a precautionary
        advisory for residents to use bottled water while treatment facilities were inspected.
        Officials said the contamination did not exceed federal action thresholds and was
        resolved within 48 hours. Following the advisory, the Senate Environment and Public
        Works Committee called for updated water testing protocols.
      </p>`
  },
  // 4 — Emergency alert system failure
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        FEMA disclosed that a technical failure prevented the national emergency alert system
        from transmitting a test broadcast to approximately 30% of mobile devices in three
        states. The failure was identified within minutes and no real emergency was active at
        the time. Several weeks earlier, <strong>${senator}</strong>, chair of a Senate
        homeland security subcommittee, had asserted that the nation's emergency alert
        infrastructure was fully operational and ready to perform under real-world conditions.
        Following the failure, <strong>${senator}</strong> urged FEMA to accelerate a planned
        system upgrade.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        FEMA disclosed that a technical failure prevented the national emergency alert system
        from transmitting a test broadcast to approximately 30% of mobile devices in three
        states. The failure was identified within minutes and no real emergency was active at
        the time. Following the failure, the Senate homeland security subcommittee urged
        FEMA to accelerate a planned system upgrade.
      </p>`
  },
  // 5 — Hospital network cyberattack
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        The Department of Health and Human Services confirmed that a ransomware attack
        temporarily knocked several administrative systems offline at a network of regional
        hospitals. Patient care was not disrupted and clinical records remained secure, but
        billing and scheduling systems were unavailable for approximately 18 hours.
        Several weeks earlier, <strong>${senator}</strong>, chair of the Senate Health
        Committee's cybersecurity task force, had stated that federally funded hospitals had
        made sufficient progress in hardening their digital infrastructure against cyber
        threats. Following the attack, <strong>${senator}</strong> introduced legislation
        requiring mandatory cybersecurity audits for hospitals receiving federal funding.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        The Department of Health and Human Services confirmed that a ransomware attack
        temporarily knocked several administrative systems offline at a network of regional
        hospitals. Patient care was not disrupted and clinical records remained secure, but
        billing and scheduling systems were unavailable for approximately 18 hours.
        Following the attack, the Senate Health Committee's cybersecurity task force
        introduced legislation requiring mandatory cybersecurity audits for hospitals
        receiving federal funding.
      </p>`
  },
  // 6 — Railroad signal failure
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        The National Transportation Safety Board reported that a signal system failure caused
        two freight trains to be routed onto the same track segment for approximately
        four minutes before operators intervened and halted both trains. No collision
        occurred and no injuries were reported. Several weeks earlier,
        <strong>${senator}</strong>, chair of the Senate Commerce Committee's rail safety
        panel, had stated that the nation's rail signaling infrastructure met all federal
        safety requirements. Following the incident, <strong>${senator}</strong> announced
        a review of signal system inspection standards.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        The National Transportation Safety Board reported that a signal system failure caused
        two freight trains to be routed onto the same track segment for approximately
        four minutes before operators intervened and halted both trains. No collision
        occurred and no injuries were reported. Following the incident, the Senate Commerce
        Committee's rail safety panel announced a review of signal system inspection
        standards.
      </p>`
  },
  // 7 — Nuclear plant monitoring error
  {
    headline: (senator) => `
      <p style="text-align:left;line-height:1.8;">
        The Nuclear Regulatory Commission reported that automated sensors at a nuclear
        generating facility provided erroneous readings for approximately six hours due to
        a firmware error, requiring operators to switch to manual monitoring protocols.
        Plant safety systems functioned normally throughout the incident and radiation
        levels remained within acceptable limits. Several weeks earlier,
        <strong>${senator}</strong>, chair of the Senate Environment and Public Works
        Committee's nuclear oversight panel, had said that the NRC's monitoring requirements
        were sufficient to ensure plant safety. Following the incident,
        <strong>${senator}</strong> requested a briefing from the NRC on sensor reliability
        standards.
      </p>`,
    setupOnly: `
      <p style="text-align:left;line-height:1.8;">
        The Nuclear Regulatory Commission reported that automated sensors at a nuclear
        generating facility provided erroneous readings for approximately six hours due to
        a firmware error, requiring operators to switch to manual monitoring protocols.
        Plant safety systems functioned normally throughout the incident and radiation
        levels remained within acceptable limits. Following the incident, the Senate
        Environment and Public Works Committee requested a briefing from the NRC on sensor
        reliability standards.
      </p>`
  }
];

// Resilience and vulnerability records (indexed 0–7)
const statementRecords = {
  0: {
    resilienceTexts: ["R0_1","R0_2","R0_3","R0_4","R0_5","R0_6","R0_7","R0_8","R0_9","R0_10"],
    vulnerabilityTexts: ["V0_1","V0_2","V0_3","V0_4","V0_5","V0_6","V0_7","V0_8","V0_9","V0_10"]
  },
  1: {
    resilienceTexts: ["R1_1","R1_2","R1_3","R1_4","R1_5","R1_6","R1_7","R1_8","R1_9","R1_10"],
    vulnerabilityTexts: ["V1_1","V1_2","V1_3","V1_4","V1_5","V1_6","V1_7","V1_8","V1_9","V1_10"]
  },
  2: {
    resilienceTexts: ["R2_1","R2_2","R2_3","R2_4","R2_5","R2_6","R2_7","R2_8","R2_9","R2_10"],
    vulnerabilityTexts: ["V2_1","V2_2","V2_3","V2_4","V2_5","V2_6","V2_7","V2_8","V2_9","V2_10"]
  },
  3: {
    resilienceTexts: ["R3_1","R3_2","R3_3","R3_4","R3_5","R3_6","R3_7","R3_8","R3_9","R3_10"],
    vulnerabilityTexts: ["V3_1","V3_2","V3_3","V3_4","V3_5","V3_6","V3_7","V3_8","V3_9","V3_10"]
  },
  4: {
    resilienceTexts: ["R4_1","R4_2","R4_3","R4_4","R4_5","R4_6","R4_7","R4_8","R4_9","R4_10"],
    vulnerabilityTexts: ["V4_1","V4_2","V4_3","V4_4","V4_5","V4_6","V4_7","V4_8","V4_9","V4_10"]
  },
  5: {
    resilienceTexts: ["R5_1","R5_2","R5_3","R5_4","R5_5","R5_6","R5_7","R5_8","R5_9","R5_10"],
    vulnerabilityTexts: ["V5_1","V5_2","V5_3","V5_4","V5_5","V5_6","V5_7","V5_8","V5_9","V5_10"]
  },
  6: {
    resilienceTexts: ["R6_1","R6_2","R6_3","R6_4","R6_5","R6_6","R6_7","R6_8","R6_9","R6_10"],
    vulnerabilityTexts: ["V6_1","V6_2","V6_3","V6_4","V6_5","V6_6","V6_7","V6_8","V6_9","V6_10"]
  },
  7: {
    resilienceTexts: ["R7_1","R7_2","R7_3","R7_4","R7_5","R7_6","R7_7","R7_8","R7_9","R7_10"],
    vulnerabilityTexts: ["V7_1","V7_2","V7_3","V7_4","V7_5","V7_6","V7_7","V7_8","V7_9","V7_10"]
  }
};

jsPsych.data.addProperties({
  trials: trials,
  participantId: participantId,
  studyId: studyId,
  sessionId: sessionId,
  expcondition: expcondition
});

const filename = `${participantId}_${studyId}_${sessionId}.csv`;

// Political Ideology
const politicalResponses = [
  "1 = Extremely liberal",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7 = Extremely conservative",
];

// Experimenter Demand Effects
const demandEffectsResponses = [
  "1 = Not at all",
  "2",
  "3",
  "4",
  "5 = Very much so"
];

// ENTER FULLSCREEN //
const enterFullscreen = {
  type: jsPsychFullscreen,
  name: 'enter_fullscreen',
  fullscreen_mode: true,
  delay_after: 0
};

timeline.push(enterFullscreen)

// CONSENT FORM - updated to html to force response as I couldn't make the force response to work//
const consentForm = {
  type: jsPsychSurveyHtmlForm,
  preamble: '<h2 style="text-align: center"><strong>Request to Participate in Research</strong></h2>',
  html: `
    <div style="text-align: left; max-width: 800px; margin: auto;">
      <p>
        We would like to invite you to take part in an online research project. 
        The purpose of this research is to investigate how people process health information. 
      </p>
      <ul style="list-style-position: outside; padding-left: 20px;">
        <li>You must be at least 18 years old to take part in this research.</li>
        <li>The study will take approximately 15 minutes to complete.</li>
        <li>You will be compensated $3 for your participation in the study.</li>
        <li>The possible risks or discomforts of the study are minimal. You may feel uncomfortable reflecting on and answering some questions.</li>
        <li>There are no direct benefits for participating in the study.</li>
        <li>Your part in this study will be handled in a confidential manner. 
        Only the researchers will know that you participated in this study. 
        Any reports or publications based on this research will use only group data and will not identify you or any individual as being part of this project. 
        The only individually-identifying data we receive from Prolific are your unique identifier and your country.</li>
        <li>The decision to participate in this research project is up to you. You do not have to participate.</li>
        <li>Even if you begin the study, you may withdraw at any time. If you do not complete the survey submission, you will not be paid.</li>
      </ul>
      <p>
        If you have any questions regarding electronic privacy, please feel free to contact Northeastern University’s 
        Office of Information Security via phone at 617-373-7901, or via email at <a href="mailto:privacy@neu.edu">privacy@neu.edu</a>.
      </p>
      <p>
        If you have any questions about this study, please feel free to contact the Principal Investigator 
        Briony Swire-Thompson at <a href="mailto:b.swire-thompson@northeastern.edu">b.swire-thompson@northeastern.edu</a>; the person mainly responsible for the research. 
        If you have any questions about your rights as a research subject, you can contact Northeastern University’s 
        Office of Human Subject Research Protection at <a href="mailto:irb@neu.edu">irb@neu.edu</a> or 617-373-4588. You may call anonymously if you wish.
      </p>
      <p>
        This study has been reviewed and approved by the Northeastern University Institutional Review Board (#20-12-16).
      </p>
      <p><b>If you do not wish to consent, please exit this website now.</b></p>
      <p>
        By clicking on the “Consent given” button below you are indicating that you consent to participate in this study. 
        Please print out a copy of this consent screen or download a copy of the consent form for your records.
      </p>
      <p style="text-align: center;">
        <label style="margin-right: 20px;">
          <input type="radio" name="consent" value="Consent given" required> Consent given
        </label>
        <label>
          <input type="radio" name="consent" value="Consent not given"> Consent not given
        </label>
      </p>
    </div>
  `,
  on_finish: function (data) {
    const response = data.response.consent;
    if (!response) {
      alert("You must select an option to proceed.");
      return false; // Prevents moving forward
    }
    if (response === "Consent not given") {
      jsPsych.endExperiment(
        `<p class="jspsych-center">
          You did not consent to participate in this study.<br>
          Please return this study in Prolific.
        </p>`
      );
    }
  }
};

timeline.push(consentForm);

// Pre-intervention instructions
const preIntInstructions = {
  type: jsPsychInstructions,
  pages: [`
        <p style="text-align: left;">
          Thank you for agreeing to participate.
        </p>
        <p style="text-align: left;">
        On the next page, you will receive some information.
        Please read the information carefully before continuing to the main task.
        </p>`
      ],
      show_clickable_nav: true,
      on_load: function() {
        window.scrollTo(0, 0);
      }
    };

// Pre-intervention instructions
timeline.push(preIntInstructions);



// Sampling instructions //
// Added 5 second delay to force reading
const preSamplingInstructions = {
  type: jsPsychInstructions,
  pages: [`
    <p style="text-align: left; line-height: 1.6;">
      Thank you! Now you will view some ficticuous headlines for "next week's news".
      </p>
      <p style="text-align: left; line-height: 1.6;">
  After you tell us your thoughts about the event, you will have the opportunity to see some additional information.
  </p>
  <p style="text-align: left; line-height: 1.6;">
    You can choose to view as much or as little information as you'd like, including no information.
    </p>`
      ],
      show_clickable_nav: true,
      on_load: function() {
        window.scrollTo(0, 0);

    // Disable the "Next" button initially
    const nextButton = document.querySelector('#jspsych-instructions-next');
    if (nextButton) {
      nextButton.disabled = true;
      setTimeout(() => {
        nextButton.disabled = false;
        //JANE MAKE 5000 BEFORE LAUNCH
      }, 1000);
    }
  }
};

timeline.push(preSamplingInstructions);
    
    


    const avatarNames = Array.from({ length: 20 }, (_, i) => "avatar" + i);
    const avatarPhotos = Array.from({ length: 20 }, (_, i) => `./avatars/avatar${i + 1}.webp`);

let avatarDictionary = {};

for (let i = 0; i < 20; i++) {
  let avatarData = { avatar: avatarPhotos[i] };
  avatarDictionary[avatarNames[i + 1]] = avatarData;
};

// SCENARIO SETUP -------------------------------------------------------

const democraticSenators = [
  "Senator Elizabeth Warren (D-MA)",
  "Senator Amy Klobuchar (D-MN)",
  "Senator Chuck Schumer (D-NY)",
  "Senator Cory Booker (D-NJ)",
  "Senator John Fetterman (D-PA)"
];

const republicanSenators = [
  "Senator Marco Rubio (R-FL)",
  "Senator Rick Scott (R-FL)",
  "Senator Tom Cotton (R-AR)",
  "Senator Ted Cruz (R-TX)",
  "Senator Lindsey Graham (R-SC)"
];

// Shuffle each party list then assign one senator per trial (4 D, 4 R for 8 trials)
const shuffledDems = jsPsych.randomization.shuffle([...democraticSenators]);
const shuffledReps = jsPsych.randomization.shuffle([...republicanSenators]);

// Build a pool: 4 from each party, then shuffle so party order is random across trials
const senatorPool = jsPsych.randomization.shuffle([
  ...shuffledDems.slice(0, 4),
  ...shuffledReps.slice(0, 4)
]);

// Map each trial index to its assigned senator (senatorPool[i] for the i-th trial in presentation order)
const trialSenators = {};
trials.forEach((claimIndex, i) => {
  trialSenators[claimIndex] = senatorPool[i];
});

// END SCENARIO SETUP ----------------------------------------------------

// Restructure the experiment flow to rate, sample, and rerate each claim

// Loop through each trial (claim)
trials.forEach((claimIndex) => {

  const scenario = claimScenarios[claimIndex];
  const assignedSenator = trialSenators[claimIndex];
  const senatorParty = democraticSenators.includes(assignedSenator) ? 'Democrat' : 'Republican';

  // SCENARIO PAGE: full news headline with senator piped in
  const scenarioPage = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="text-align: left; max-width: 750px; margin: auto;">
        <p style="font-size:0.9em; color:#666; margin-bottom:0.25em; text-transform:uppercase; letter-spacing:0.05em;">
          Next Week's News
        </p>
        <h2 style="margin-top:0; margin-bottom:1em;">${claims[claimIndex]}</h2>
        ${scenario.headline(assignedSenator)}
      </div>`,
    choices: ["Continue"],
    on_load: function () {
      window.scrollTo(0, 0);
    },
    on_finish: function (data) {
      data.claim_index = claimIndex;
      data.claim_name = claims[claimIndex];
      data.senator = assignedSenator;
      data.senator_party = senatorParty;
    }
  };

  // Pre-sampling proximity rating — 100-point slider
  const preBelief = {
    type: jsPsychHtmlSliderResponse,
    stimulus: `
      <div style="max-width: 750px; margin: auto;">
        <p>Based on what you have just read, how close do you think this event came to actually occurring?</p>
      </div>`,
    labels: ["Did not come close at all", "Came extremely close"],
    min: 0,
    max: 100,
    start: 50,
    step: 1,
    slider_width: 600,
    require_movement: true,
    button_label: "Next",
    on_load: function () {
      window.scrollTo(0, 0);
    },
    on_finish: function (data) {
      data.claim_index = claimIndex;
      data.claim_name = claims[claimIndex];
      data.senator = assignedSenator;
      data.senator_party = senatorParty;
      data.question_name = `preProximity_claim${claimIndex}`;
    }
  };

  // Sampling task for the current claim
  const samplingTask = {
    type: jsPsychSelectionLearning,
    trialIndex: claimIndex,
    avatars: avatarDictionary,
    statement: '',
    isTrueStatement: false,
    resilienceTexts: statementRecords[claimIndex].resilienceTexts,
    vulnerabilityTexts: statementRecords[claimIndex].vulnerabilityTexts,
    choices: [
      "<i class='fa-solid fa-rotate-left'></i>&nbsp;&nbsp;View more",
      "<i class='fa-solid fa-circle-check' style='color: green'></i>&nbsp;&nbsp;I'm all done",
    ],
    on_load: function () {
      window.scrollTo(0, 0);
    },
    on_finish: function (data) {
      data.claim_index = claimIndex;
      data.claim_name = claims[claimIndex];
      data.senator = assignedSenator;
      data.senator_party = senatorParty;
    }
  };

  // Blank page to avoid issues with sampling task
  const blankPage = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    choices: "NO_KEYS",
    trial_duration: 20,
  };

  // Post-sampling proximity rating — setup-only headline, no senator reference
  const postBelief = {
    type: jsPsychHtmlSliderResponse,
    stimulus: `
      <div style="text-align: left; max-width: 750px; margin: auto;">
        <p style="font-size:0.9em; color:#666; margin-bottom:0.25em; text-transform:uppercase; letter-spacing:0.05em;">
          Next Week's News
        </p>
        <h2 style="margin-top:0; margin-bottom:1em;">${claims[claimIndex]}</h2>
        ${scenario.setupOnly}
        <p style="margin-top:1.5em;">Now, based on everything you have read, how close do you think this event came to actually occurring?</p>
      </div>`,
    labels: ["Did not come close at all", "Came extremely close"],
    min: 0,
    max: 100,
    start: 50,
    step: 1,
    slider_width: 600,
    require_movement: true,
    button_label: "Next",
    on_load: function () {
      window.scrollTo(0, 0);
    },
    on_finish: function (data) {
      data.claim_index = claimIndex;
      data.claim_name = claims[claimIndex];
      data.senator = assignedSenator;
      data.senator_party = senatorParty;
      data.question_name = `postProximity_claim${claimIndex}`;
    }
  };

  // Add the tasks for the current claim to the timeline
  timeline.push(scenarioPage);
  timeline.push(preBelief);
  timeline.push(samplingTask);
  timeline.push(blankPage);
  timeline.push(postBelief);
});

// Post-sampling belief ratings for only the selected trials
// VACCINE INTENTIONS
const vaxxInt = {
  type: jsPsychSurveyMultiChoice,
  preamble: `<p>Now, please imagine that a new type of mRNA vaccine has been developed that can offer broad protection against a variety of infectious diseases, such as new strains of the flu, common cold viruses, and other emerging pathogens. This general mRNA vaccine is designed to be updated regularly to adapt to new threats, similar to how current flu vaccines are updated each year.</p>
  <p>Clinical trials have shown that the vaccine is highly effective, with common side effects like mild fever, headache, or fatigue lasting a few days after the injection. It would be administered once a year and could significantly reduce the chances of getting sick from seasonal viruses and other infections.</p>
  <p>Given this information, please answer the following questions regarding your willingness to get this vaccine.</p>`,
  questions: [
    {
      name: `vaxxInt1`,
      prompt: `<blockquote>How likely are you to get the general mRNA vaccine if it becomes available?</blockquote>`,
      options: ["1 - Very Unlikely", "2", "3", "4", "5", "6", "7 - Very Likely"],
      required: true,
      horizontal: true,
    },
    {
      name: `vaxxInt2`,
      prompt: `<blockquote>How beneficial do you think the general mRNA vaccine would be for your overall health?</blockquote>`,
      options: ["1 - Not Very Beneficial", "2", "3", "4", "5", "6", "7 - Very Beneficial"],
      required: true,
      horizontal: true,
    },
    {
      name: `vaxxInt3`,
      prompt: `<blockquote>If the general mRNA vaccine were recommended by healthcare providers, how likely would you be to follow this recommendation?</blockquote>`,
      options: ["1 - Very Unlikely", "2", "3", "4", "5", "6", "7 - Very Likely"],
      required: true,
      horizontal: true,
    },
    {
      name: `vaxxInt4`,
      prompt: `<blockquote>How likely would you be to encourage others (family, friends) to get the general mRNA vaccine?</blockquote>`,
      options: ["1 - Very Unlikely", "2", "3", "4", "5", "6", "7 - Very Likely"],
      required: true,
      horizontal: true,
    }
  ],
  randomize_question_order: false,
  on_load: function() {
    window.scrollTo(0, 0);
    const nextButton = document.querySelector('#jspsych-survey-multi-choice-next');
    nextButton.disabled = true;

    const checkResponses = () => {
      const responses = document.querySelectorAll('.jspsych-survey-multi-choice-question');
      let allAnswered = true;
      responses.forEach(response => {
        const options = response.querySelectorAll('input[type="radio"]');
        const answered = Array.from(options).some(option => option.checked);
        if (!answered) {
          allAnswered = false;
        }
      });
      nextButton.disabled = !allAnswered;
    };

    document.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', checkResponses);
    });
  }
};

// Post-sampling belief
timeline.push(vaxxInt);

// DEMOGRAPHICS //
const demographicsQuestions = {
  type: jsPsychSurveyHtmlForm,
  preamble:
    `<p class="jspsych-survey-multi-choice-preamble">
      Using the scales provided, please respond to each question about you as an individual:
    </p>`,
  html: `
        <!-- Age -->

        <div class="jspsych-survey-multi-choice-question">
          <label for="age">How old are you?</label><br>
          <input 
            type="number" 
            id="age" 
            name="age" 
            min="18" max="100" 
            style="padding: 5px; width: 40px;" 
            class="incomplete"
            oninput="this.classList.remove('incomplete');"
          >
        </div>
        

        <!-- Race/Ethnicity -->

        <div class="jspsych-survey-multi-choice-question">
          <legend>Please indicate how you identify yourself:</legend>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox" 
              id="race-ethnicity-indigenous" 
              name="race-ethnicity-indigenous" 
              value="Indigenous American or Alaskan Native" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-indigenous">Indigenous American or Alaskan Native</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox" 
              id="race-ethnicity-asian" 
              name="race-ethnicity-asian" 
              value="Asian or Asian-American" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-asian">Asian or Asian-American</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox" 
              id="race-ethnicity-black" 
              name="race-ethnicity-black" 
              value="African-American or Black" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-black">African-American or Black</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox" 
              id="race-ethnicity-native" 
              name="race-ethnicity-native" 
              value="Native Hawaiian or Pacific Islander" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-native">Native Hawaiian or other Pacific Islander</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox" 
              id="race-ethnicity-white" 
              name="race-ethnicity-white" 
              value="White" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-white">White</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox" 
              id="race-ethnicity-hispanic" 
              name="race-ethnicity-hispanic" 
              value="Hispanic/Latino/a/x" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-hispanic">Hispanic/Latino/a/x</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox" 
              id="race-ethnicity-other" 
              name="race-ethnicity-other" 
              value="Other" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-other">Other</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="checkbox"
              id="race-ethnicity-prefer-not" 
              name="race-ethnicity-prefer-not" 
              value="Prefer not to disclose" 
              class="demographics-race-ethnicity incomplete"
              oninput="
                let demographicsRaceEthnicity = document.querySelectorAll(
                  '.demographics-race-ethnicity'
                );
                for (let i = 0; i < demographicsRaceEthnicity.length; i++) {
                  demographicsRaceEthnicity[i].classList.remove('incomplete');
                };
              "
            >
            <label for="race-ethnicity-prefer-not">Prefer not to disclose</label>
          </div>
        </div>


        <!-- Gender -->
        
        <div class="jspsych-survey-multi-choice-question">
          <legend>With which gender do you most closely identify?</legend>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="gender-man" 
              name="gender" 
              value="Man" 
              class="demographics-gender incomplete"
              oninput="
                let demographicsGender = document.querySelectorAll(
                  '.demographics-gender'
                );
                for (let i = 0; i < demographicsGender.length; i++) {
                  demographicsGender[i].classList.remove('incomplete');
                };
              "
            >
            <label for="gender-man">Man</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="gender-woman" 
              name="gender" 
              value="Woman" 
              class="demographics-gender incomplete"
              oninput="
                let demographicsGender = document.querySelectorAll(
                  '.demographics-gender'
                );
                for (let i = 0; i < demographicsGender.length; i++) {
                  demographicsGender[i].classList.remove('incomplete');
                };
              "
            >
            <label for="gender-woman">Woman</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="gender-non-binary" 
              name="gender" 
              value="Non-binary" 
              class="demographics-gender incomplete"
              oninput="
                let demographicsGender = document.querySelectorAll(
                  '.demographics-gender'
                );
                for (let i = 0; i < demographicsGender.length; i++) {
                  demographicsGender[i].classList.remove('incomplete');
                };
              "
            >
            <label for="gender-non-binary">Non-binary</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="gender-other" 
              name="gender" 
              value="Other" 
              class="demographics-gender incomplete"
              oninput="
                let demographicsGender = document.querySelectorAll(
                  '.demographics-gender'
                );
                for (let i = 0; i < demographicsGender.length; i++) {
                  demographicsGender[i].classList.remove('incomplete');
                };
              "
            >
            <label for="gender-other">Other</label>
          </div>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="gender-prefer-not" 
              name="gender" 
              value="Prefer not to disclose" 
              class="demographics-gender incomplete"
              oninput="
                let demographicsGender = document.querySelectorAll(
                  '.demographics-gender'
                );
                for (let i = 0; i < demographicsGender.length; i++) {
                  demographicsGender[i].classList.remove('incomplete');
                };
              "
            >
            <label for="gender-prefer-not">Prefer not to disclose</label>
          </div>
        </div>


        <!-- Education -->
        
        <div class="jspsych-survey-multi-choice-question">
          <legend>
            What is the highest level of education you have received? 
            (If you are currently enrolled in school, please indicate the highest degree you have received)
          </legend>
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="education-less-high-school" 
              name="education" 
              value="Less than a high school diploma" 
              class="demographics-education incomplete"
              oninput="
                let demographicsEducation = document.querySelectorAll(
                  '.demographics-education'
                );
                for (let i = 0; i < demographicsEducation.length; i++) {
                  demographicsEducation[i].classList.remove('incomplete');
                };
              "
            >
            <label for="education-less-high-school">
              Less than a high school diploma
            </label>
          </div>

          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="education-high-school" 
              name="education" 
              value="High school degree or equivalent (e.g. GED)" 
              class="demographics-education incomplete"
              oninput="
                let demographicsEducation = document.querySelectorAll(
                  '.demographics-education'
                );
                for (let i = 0; i < demographicsEducation.length; i++) {
                  demographicsEducation[i].classList.remove('incomplete');
                };
              "
            >
            <label for="education-high-school">
              High school degree or equivalent (e.g. GED)
            </label>
          </div>

          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="education-some-college" 
              name="education" 
              value="Some college, no degree" 
              class="demographics-education incomplete"
              oninput="
                let demographicsEducation = document.querySelectorAll(
                  '.demographics-education'
                );
                for (let i = 0; i < demographicsEducation.length; i++) {
                  demographicsEducation[i].classList.remove('incomplete');
                };
              "
            >
            <label for="education-some-college">
              Some college, no degree
            </label>
          </div>

          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="education-associate" 
              name="education" 
              value="Associate Degree (e.g. AA, AS)" 
              class="demographics-education incomplete"
              oninput="
                let demographicsEducation = document.querySelectorAll(
                  '.demographics-education'
                );
                for (let i = 0; i < demographicsEducation.length; i++) {
                  demographicsEducation[i].classList.remove('incomplete');
                };
              "
            >
            <label for="education-associate">
              Associate Degree (e.g. AA, AS)
            </label>
          </div>

          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="education-bachelors" 
              name="education" 
              value="Bachelor's Degree (e.g. BA, BS)" 
              class="demographics-education incomplete"
              oninput="
                let demographicsEducation = document.querySelectorAll(
                  '.demographics-education'
                );
                for (let i = 0; i < demographicsEducation.length; i++) {
                  demographicsEducation[i].classList.remove('incomplete');
                };
              "
            >
            <label for="education-bachelors">
              Bachelor's Degree (e.g. BA, BS)
            </label>
          </div>
          
          <div class="jspsych-survey-multi-choice-option">
            <input 
              type="radio" 
              id="education-postgraduate" 
              name="education" 
              value="Postgraduate Degree (e.g. Master's Degree, Professional Degree, Doctorate Degree)" 
              class="demographics-education incomplete"
              oninput="
                let demographicsEducation = document.querySelectorAll(
                  '.demographics-education'
                );
                for (let i = 0; i < demographicsEducation.length; i++) {
                  demographicsEducation[i].classList.remove('incomplete');
                };
              "
            >
            <label for="education-postgraduate">
              Postgraduate Degree (e.g. Master's Degree, Professional Degree, Doctorate Degree)
            </label>
          </div>
        </div>
        
        <style id="jspsych-survey-multi-choice-css">
          .jspsych-survey-multi-choice-question { 
            margin-top: 2em; 
            margin-bottom: 2em; 
            text-align: left; 
          } .jspsych-survey-multi-choice-option { 
            font-size: 10pt; 
            line-height: 2; 
          } .jspsych-survey-multi-choice-horizontal 
            .jspsych-survey-multi-choice-option { 
            display: inline-block; 
            margin-left: 1em; 
            margin-right: 1em; 
            vertical-align: top; 
            text-align: center; 
          } label.jspsych-survey-multi-choice-text input[type='radio'] {
            margin-right: 1em;
          }
        </style>
      `,
      button_label: 'Next',
      required: true,
      on_load: function() {
        window.scrollTo(0, 0);
      },
  on_finish: function (data) {
    let demographicsData = data.response;

    // Age
    const age = Number(demographicsData['age']);

    // Gender
    let gender = '';
    if (demographicsData['gender-man']) {
      gender = 'Man';
    } else if (demographicsData['gender-woman']) {
      gender = 'Woman';
    } else if (demographicsData['gender-non-binary']) {
      gender = 'Non-Binary';
    } else if (demographicsData['gender-other']) {
      gender = 'Other';
    }

    // Create a new object with the formatted data
    demographicsData = {
      age: age,
      race_ethnicity_indigenous: demographicsData['race-ethnicity-indigenous'],
      race_ethnicity_asian: demographicsData['race-ethnicity-asian'],
      race_ethnicity_black: demographicsData['race-ethnicity-black'],
      race_ethnicity_native: demographicsData['race-ethnicity-native'],
      race_ethnicity_white: demographicsData['race-ethnicity-white'],
      race_ethnicity_hispanic: demographicsData['race-ethnicity-hispanic'],
      race_ethnicity_other: demographicsData['race-ethnicity-other'],
      race_ethnicity_na: demographicsData['race-ethnicity-prefer-not'],
      gender: gender
    };

    jsPsych.data
      .getDataByTimelineNode(jsPsych.getCurrentTimelineNodeID())
      .addToAll(demographicsData);
  }
};

// timeline.push(demographicsQuestions);


const politicsQuestions = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      name: 'political-ideology-economic',
      prompt: `
            <p class="jspsych-survey-multi-choice-question">
              Which response best captures your political beliefs surrounding <strong>economic</strong> issues?
            </p>`,
      options: politicalResponses,
      horizontal: true
    },
    {
      name: 'political-ideology-social',
      prompt: `
            <p class="jspsych-survey-multi-choice-question">
              Which response best captures your political beliefs surrounding <strong>social</strong> issues?
            </p>`,
      options: politicalResponses,
      horizontal: true
    },
    {
      name: 'political-ideology-overall',
      prompt: `
            <p class="jspsych-survey-multi-choice-question">
              Which response best captures your <strong>overall</strong> political beliefs?
            </p>`,
      options: politicalResponses,
      horizontal: true
    }
  ],
  preamble: `
        <p class="jspsych-survey-multi-choice-preamble">
          Please answer the following questions about your political ideology:
        </p>`,
        request_response: true, // We should require response
        on_load: function() {
          window.scrollTo(0, 0);
        },
        on_finish: function (data) {
          let politicalData = data.response;

    politicalData = {
      political_ideology_economic: politicalData['political-ideology-economic'],
      political_ideology_social: politicalData['political-ideology-social'],
      political_ideology_overall: politicalData['political-ideology-overall']
    };

    jsPsych.data
      .getDataByTimelineNode(jsPsych.getCurrentTimelineNodeID())
      .addToAll(politicalData);
  }
};

// timeline.push(politicsQuestions);


const demandEffectsQuestions = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      name: 'pressure',
      prompt:
        `<p class="jspsych-survey-multi-choice-question">
            Did you feel pressure to respond in a particular way to any of the questions?
          </p>`,
      options: demandEffectsResponses,
      horizontal: true
    },
    {
      name: 'judgment',
      prompt:
        `<p class="jspsych-survey-multi-choice-question">
            Did you feel as though you might be judged for your responses to the questions you answered?
          </p>`,
      options: demandEffectsResponses,
      horizontal: true
    }
  ],
  randomize_question_order: true,
  required: true,
  scale_width: 500,
  preamble:
    `<p class="jspsych-survey-multi-choice-preamble">
        For these final questions, please answer as honestly as you can.
        The answers to these questions will <strong>not</strong> affect whether or not you receive credit/payment for participation!
      </p>`,
      on_load: function() {
        window.scrollTo(0, 0);
      },
  on_finish: function (data) {
    let demandEffectsData = data.response;

    demandEffectsData = {
      pressure: demandEffectsData['pressure'],
      judgment: demandEffectsData['judgment']
    };

    jsPsych.data
      .getDataByTimelineNode(jsPsych.getCurrentTimelineNodeID())
      .addToAll(demandEffectsData);
  }
};

// timeline.push(demandEffectsQuestions);


// Guess Study Purpose / Questions + Comments
const feedback = {
  type: jsPsychSurveyText,
  questions: [
    {
      name: 'guess-study-purpose',
      prompt: 'What do you think this study was about?',
      columns: 100,
      rows: 10
    },
    {
      name: 'feedback',
      prompt: 'Do you have any additional comments? We appreciate any and all feedback!',
      columns: 100,
      rows: 10
    }
  ],
  on_load: function() {
    window.scrollTo(0, 0);
  },
  on_finish: function (data) {
    let purposeFeedbackData = data.response;

    purposeFeedbackData = {
      guess_study_purpose: purposeFeedbackData['guess-study-purpose'],
      feedback: purposeFeedbackData['feedback']
    };

    jsPsych.data
      .getDataByTimelineNode(jsPsych.getCurrentTimelineNodeID())
      .addToAll(purposeFeedbackData);
  }
}

// timeline.push(feedback);


// DEBRIEF FORM
const debriefForm = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="text-align: left; max-width: 800px; margin: auto;">
    <h2 style="text-align: center"><strong>Debriefing Sheet</strong></h2>
    <h3 style="text-align: center"><strong>Processing health information</strong></h3>
    <h3 style="text-align: center"><strong>Northeastern University IRB # 20-12-16</strong></h3>
      <p>Thank you for participating in our study! 
      This study seeks to investigate the effects of a media literacy intervention on information seeking from different sources. 
      In the study you just participated in, we assigned people to either the intervention or control condition.  
      During the study you viewed eight vaccine-related claims, four of which were true and four of which were false. 
      Please find the fact checks below for each of the claims. </p>
      <p>You were also given the opportunity to sample the beliefs of a range of medical professionals and alternative medicine practitioners. 
      These belief ratings were entirely simulated, set such that belief ratings for medical professionals were always accurate, 
      and belief ratings from alternative medicine practitioners was always inaccurate. </p>
      <p>
        <strong>"You can test positive for HPV as a result of receiving the HPV vaccine."</strong> - This is <span style="color: red;"><strong>FALSE</strong></span>
      </p>
      <p style="text-indent: 40px;">
        As outlined by <a href="https://www.chop.edu/vaccine-education-center/vaccine-details/human-papillomavirus/prevent-hpv" target="_blank">the Children’s Hospital of Philadelphia</a>, the HPV vaccine cannot cause a positive test result for HPV. The HPV vaccine is created using a protein from the surface of the HPV virus but does not contain any genetic material from the live virus itself. Because of this, the particles in the HPV vaccine cannot replicate and cause an infection. 
      </p>
      <p>
        <strong>"Vaccines can cure chronic illnesses if they target the underlying virus or bacteria."</strong> - <span style="color: red;"><strong>FALSE</strong></span>
      </p>
      <p style="text-indent: 40px;">
        Vaccines are designed to prevent infection, not to treat an underlying disease or illness. They work by stimulating the immune system to recognize and combat specific pathogens before an individual becomes infected (<a href="https://www.cdc.gov/vaccines/basics/explaining-how-vaccines-work.html" target="_blank">CDC, 2024</a>). While vaccines have been instrumental in preventing diseases, they are not used to cure existing chronic illnesses.  
      </p>
      <p>
        <strong>"Certain vaccines can alter your DNA."</strong> - This is <span style="color: red;"><strong>FALSE</strong></span>
      </p>
      <p style="text-indent: 40px;">
      Vaccines cannot alter your DNA. mRNA vaccines work by instructing your body to build protein to protect against specific viruses, such as COVID-19. As <a href="https://www.genome.gov/about-genomics/fact-sheets/Understanding-COVID-19-mRNA-Vaccines" target="_blank">National Human Genome Research Institute (2021)</a>, explains, mRNA from vaccines does not enter the nucleus where DNA is located, and can thus not interact with or alter DNA. 
      </p>
      <p><b>Pleas click "Next" to be redirected to Prolific to recieve compensation.</b></p>
    </div>
  `,
  choices: ["Next"],
};

// timeline.push(debriefForm);


// Exit fullscreen
const exitFullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false,
  delay_after: 0
};

timeline.push(exitFullscreen);

// Choose from among these to relay via DataPipe
const preregisteredExperimentId = "pTWSMZwhLgng"; 
const debugExperimentId = "XyR978iH6AOX";

// DataPipe conclude data collection
const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: preregisteredExperimentId,
  //experiment_id: debugExperimentId, 
  filename: filename,
  data_string: () => jsPsych.data.get().csv(),
  on_finish: function (data) {
    function countdown(start, end) {
      const timer = setInterval(function () {
        if (start <= end) {
          clearInterval(timer);
        } else {
          start--;
          document.getElementById("countdown").innerHTML = start;
        }
      }, 1000);
    }

    countdown(5, 0);

    const results = jsPsych.data.get().csv();
    jsPsych.endExperiment(
      `<p class="jspsych-center">
        Thanks for completing the first half of the experiment! You will be redirected to Qualtrics to complete the remainder of the study in <span id="countdown">5</span> seconds.
      </p>`
    );

    setTimeout(function () {
      window.location.href = "https://neu.co1.qualtrics.com/jfe/form/SV_2i3DAsAHEfa4rga";
    }, 5000);
  }
};

timeline.push(save_data);

// Preload all images
const imageSet = avatarPhotos;

jsPsych.pluginAPI.preloadImages(imageSet, function () {
  startExperiment();
});

// Function to initialize the experiment; will be called once all images are preloaded
function startExperiment() {
  jsPsych.run(timeline);
};