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

// Per-claim resilience and vulnerability records (indexed 0–7 matching claimScenarios).
// Vulnerability records: evidence of how close the catastrophe came to occurring.
// Resilience records: evidence of why the catastrophe did not occur.
const statementRecords = {
 
  // 0 — Electrical grid failure
  0: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Failed Safety Layers</strong><br>
       Investigators found that 3 of the 5 automated safeguard layers designed to isolate a software fault had already failed silently in the 72 hours before the incident. Only two layers remained active when the malfunction propagated.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Prior Warning Flags</strong><br>
       Internal system logs show that the grid management software generated 14 anomalous error codes in the week preceding the malfunction. Operators were not alerted because the automated notification threshold was set too high to trigger an alarm.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Geographic Exposure</strong><br>
       At the time of the malfunction, the affected monitoring nodes were responsible for coordinating load distribution across a region supplying power to approximately 4.2 million homes and businesses.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Expert Risk Assessment</strong><br>
       A post-incident review by the North American Electric Reliability Corporation rated the probability of a cascading regional blackout — had the malfunction persisted another 40 minutes — at approximately 68%, based on grid load conditions at the time.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Historical Parallel</strong><br>
       The 2003 Northeast blackout, which left 55 million people without power, was triggered by a software alarm failure with a nearly identical technical signature to the current incident. That event caused an estimated $6 billion in economic losses.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Deferred Maintenance Record</strong><br>
       Federal audit records show that the grid management software involved had been flagged for a critical security and stability patch 18 months prior to the incident. The patch was deferred three times due to scheduling constraints and had not been applied at the time of the malfunction.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Time-to-Failure Estimate</strong><br>
       Engineers from the grid operator's incident response team estimated that, without manual intervention, automated load-shedding protocols would have begun failing within approximately 40 minutes of the initial malfunction — a process that, once started, is difficult to reverse.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Operator Detection Delay</strong><br>
       Control room operators did not identify the software malfunction as a critical fault for 23 minutes after it began. During that window, the system continued to issue incorrect routing instructions to 11 regional substations.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; Cascading Failure Pathway</strong><br>
       Modeling conducted after the incident found that a 90-minute continuation of the fault would have triggered overload conditions at two high-voltage transmission lines. Failure of both lines simultaneously would have caused an uncontrolled outage affecting at least three states.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Backup System Status</strong><br>
       Of the four redundant monitoring systems that should have taken over automatically when the primary system faulted, two were offline for scheduled maintenance and a third had a known firmware incompatibility that had not been resolved. Only one backup was fully operational.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; Manual Override Activated</strong><br>
       When automated systems began issuing incorrect routing commands, a senior grid operator on duty manually overrode the affected control nodes within 23 minutes of the fault onset, preventing incorrect load distribution from reaching critical substations.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; Backup Monitoring Engaged</strong><br>
       One fully operational redundant monitoring system automatically assumed supervisory control of the affected grid segment within 4 minutes of the primary system's fault, maintaining accurate status data for operators throughout the incident.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; Regional Operator Coordination</strong><br>
       Operators at three neighboring regional control centers were notified within 8 minutes of the fault and pre-positioned backup capacity that could have been injected into the affected area within 12 minutes if conditions had deteriorated further.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Load Conditions Were Favorable</strong><br>
       At the time of the malfunction, regional electricity demand was running approximately 22% below peak capacity due to mild weather, providing a significant safety margin that reduced the risk of overload conditions developing.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; Successful Precedent</strong><br>
       In 2019, the same grid operator successfully managed a comparable software fault affecting a different monitoring node using identical manual intervention procedures. That incident was resolved in 17 minutes with no service disruption.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; Physical Infrastructure Intact</strong><br>
       Post-incident inspection confirmed that no physical grid infrastructure — including transformers, transmission lines, or switching equipment — was damaged or operated outside normal parameters during the malfunction. The fault was entirely contained within software systems.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; Emergency Protocol Performance</strong><br>
       The grid operator's emergency response protocol, last updated in 2022, was activated within 6 minutes of the fault being identified. All 12 procedural steps were completed in the prescribed order, and the incident was logged as a successful protocol execution.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; Operator Training Record</strong><br>
       The control room team on duty had completed mandatory grid fault response training 6 weeks before the incident, including a simulation of a software monitoring failure scenario. Post-incident review found their response closely matched the trained procedure.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; Containment Speed</strong><br>
       Full normal functionality was restored across all affected monitoring nodes within 94 minutes of the initial fault — well within the 4-hour recovery window established by federal reliability standards for this class of software incident.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; No Downstream Impact</strong><br>
       An independent review of power delivery data found zero interruptions to electricity supply in the affected region during the entire incident window. No customers experienced outages and frequency and voltage remained within acceptable limits throughout.`
    ]
  },
 
  // 1 — Air traffic control error
  1: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Radar Blind Spots</strong><br>
       During the 20-minute outage, controllers lost primary radar contact with 34 aircraft operating in the affected airspace. Seven of those aircraft were on instrument flight rules plans in low-visibility conditions and could not be visually confirmed by pilots.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Separation Violation Risk</strong><br>
       FAA incident records show that at the moment of radar loss, two commercial aircraft were operating on converging headings at the same altitude with 11 nautical miles of separation — below the 15-nautical-mile minimum required for non-radar separation in high-traffic airspace.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Staffing at Time of Incident</strong><br>
       The facility was operating with 6 controllers on duty, against a recommended staffing level of 9 for the traffic volume present. Two of the six were within the first hour of their shift, limiting their familiarity with current traffic patterns at the time of the outage.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Prior System Warnings</strong><br>
       Maintenance logs obtained by investigators show that the radar software module that failed had generated 9 system health warnings over the preceding 30 days, including two classified as high-priority. Neither triggered a maintenance work order.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Expert Assessment</strong><br>
       An aviation safety specialist retained by the investigating committee estimated that the probability of at least one loss-of-separation event — requiring emergency evasive maneuvers — would have exceeded 50% if the radar outage had persisted for another 15 minutes under those traffic conditions.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Historical Near-Miss Pattern</strong><br>
       FAA records show three previous loss-of-separation incidents at the same facility over the past five years, all occurring during periods of reduced staffing. The most recent resulted in two aircraft passing within 0.8 nautical miles of each other horizontally.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Backup System Age</strong><br>
       The backup radar system activated during the outage was installed in 2009 and had not received a hardware refresh. Its position update rate is 12 seconds, compared to 4.8 seconds for the primary system, increasing the uncertainty in aircraft position estimates.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Controller Workload During Outage</strong><br>
       Post-incident interviews with controllers found that the manual workload during the backup period was described as "at the limit of manageable" by two of the six controllers on duty. One controller reported issuing a precautionary heading change based on an estimated rather than confirmed aircraft position.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; Weather Conditions</strong><br>
       At the time of the radar outage, instrument meteorological conditions existed across approximately 60% of the affected airspace, meaning affected aircraft were flying entirely by instruments with no ability to visually detect and avoid other traffic.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Deferred Upgrade Timeline</strong><br>
       A congressionally mandated upgrade to the radar processing software at this facility, which would have addressed the vulnerability exploited by the glitch, had been delayed twice and was not scheduled for implementation until 14 months after the incident.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; Backup Radar Activation Time</strong><br>
       The facility's backup radar system came online automatically within 90 seconds of primary radar failure, providing controllers with continuous — if reduced-fidelity — position data for all aircraft in the affected airspace throughout the outage.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; Traffic Flow Reduction</strong><br>
       Within 3 minutes of the radar outage, the facility's traffic management coordinator issued a ground stop for all departures bound for the affected airspace, reducing the number of airborne aircraft under positive control by 18 over the following 12 minutes.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; Pilot Compliance</strong><br>
       All 34 aircraft that lost primary radar contact responded immediately to controller instructions to maintain assigned headings and altitudes. No pilot reported confusion or requested clarification, indicating effective crew resource management across all affected flights.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Controller Training Performance</strong><br>
       Post-incident review found that controllers applied non-radar separation standards correctly throughout the backup period. The facility had conducted a non-radar operations drill 10 weeks before the incident as part of its annual contingency training program.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; Separation Maintained</strong><br>
       FAA track data confirmed that no aircraft came within the minimum separation standards during the outage. The closest approach during the 20-minute backup period was 14.2 nautical miles horizontal and 1,000 feet vertical — within safe parameters.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; Facility Coordination</strong><br>
       Adjacent air traffic control centers were notified of the outage within 4 minutes and took on responsibility for aircraft transitioning into or out of the affected airspace, reducing the workload on affected controllers by approximately 30% during the backup period.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; Rapid Software Recovery</strong><br>
       Technical staff identified the root cause of the software glitch — a corrupted routing table entry — within 11 minutes and executed a targeted patch that restored full primary radar functionality without requiring a complete system restart.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; Similar Incident Resolved Successfully</strong><br>
       In 2021, a comparable radar software failure at a different high-traffic facility was managed using identical backup procedures. That incident lasted 31 minutes, involved 41 aircraft, and was resolved with no separation violations or safety events.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; No Aircraft Diversions Required</strong><br>
       Despite the 20-minute radar outage, no aircraft were diverted to alternate airports and all scheduled arrivals landed at their intended destinations. Total delay attributable to the incident across affected flights averaged 7 minutes.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; System Redundancy Depth</strong><br>
       The facility operates three independent radar data sources — primary, backup, and a passive receiver network. During the incident, both the backup radar and the passive receiver network were fully operational, providing two independent verification sources for aircraft positions.`
    ]
  },
 
  // 2 — Dam monitoring failure
  2: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Sensor Coverage Gap</strong><br>
       The malfunctioning sensors were responsible for monitoring 7 of the 12 critical measurement points on the dam's downstream face. During the outage, engineers had no automated data on water seepage rates, pore pressure, or structural displacement at those locations.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Duration Before Detection</strong><br>
       Investigators determined that sensors had been providing erroneous or null readings for approximately 4 hours and 20 minutes before a field engineer conducting a routine visual inspection noticed anomalous behavior and triggered a manual check.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Elevated Upstream Inflow</strong><br>
       At the time of the sensor failure, the dam's upstream reservoir was receiving inflow at 140% of the seasonal average due to heavy rainfall upstream. This elevated the structural load on the dam and increased the importance of continuous monitoring.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Expert Risk Assessment</strong><br>
       A structural engineering firm retained by investigators assessed that had water pressure increased at the rate observed in the 48 hours prior to the incident and gone undetected for an additional 6 hours, the probability of initiating a seepage event — a precursor to structural failure — would have been approximately 35%.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Historical Analogue</strong><br>
       The 2017 Oroville Dam spillway failure — which forced the evacuation of nearly 200,000 people — was preceded by undetected structural stress readings that monitoring systems failed to flag. That incident caused an estimated $1.1 billion in repair costs.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Sensor Maintenance History</strong><br>
       Records show the malfunctioning sensor array had last been calibrated 26 months before the incident, exceeding the Army Corps of Engineers' recommended 18-month calibration cycle. Two sensors in the array had generated intermittent fault codes for 6 weeks prior and had not been inspected.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Downstream Population Exposure</strong><br>
       Federal Emergency Management Agency records show that an uncontrolled dam failure at this facility would place approximately 23,000 residents in the immediate inundation zone, with potential secondary flooding affecting an additional 61,000 people.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Emergency Action Plan Status</strong><br>
       The dam's Emergency Action Plan had not been updated since 2019. Two of the six downstream emergency notification contact lists referenced in the plan contained outdated contact information for local emergency management officials.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; No Automated Outage Alert</strong><br>
       The sensor network's data management system did not generate an automated alert when sensors stopped reporting valid data. The system was configured to flag only out-of-range readings, not data absence — a known configuration gap that had been identified in a 2021 internal review but not corrected.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Similar Incident at Comparable Facility</strong><br>
       In 2020, a federally managed dam in a neighboring state experienced a sensor outage of comparable duration. Investigators in that case concluded that had reservoir levels been 8% higher at the time, the undetected pressure increase would likely have required emergency spillway operations.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; Manual Monitoring Activated</strong><br>
       Within 15 minutes of the sensor outage being identified, the Army Corps of Engineers activated its manual monitoring protocol, deploying 4 field engineers to conduct direct readings at all 12 critical measurement points at 30-minute intervals throughout the outage.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; Structural Readings Remained Normal</strong><br>
       Manual inspections conducted every 30 minutes throughout the 4-hour outage found all measurable structural indicators — including visual seepage, crest elevation, and accessible pore pressure gauges — within normal operating parameters.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; Spillway Pre-Positioning</strong><br>
       As a precautionary measure, dam operators partially opened the facility's auxiliary spillway approximately 90 minutes into the sensor outage, reducing reservoir levels by 0.4 meters and lowering structural load on the downstream face before repairs were completed.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Rapid Sensor Restoration</strong><br>
       Engineering staff identified the sensor malfunction as a power supply fault and restored full automated monitoring within 5 hours and 40 minutes of the initial failure by switching the array to a backup power circuit.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; Downstream Emergency Services Notified</strong><br>
       County emergency management officials and local law enforcement in the downstream inundation zone were notified of the sensor outage within 2 hours of detection and placed on precautionary standby, with evacuation planning activated as a contingency measure.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; Dam Physical Integrity Confirmed</strong><br>
       A post-incident structural inspection by an independent engineering firm found no evidence of seepage, settlement, cracking, or any structural change attributable to the period of unmonitored operation. The dam was assessed as structurally sound.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; Reservoir Inflow Declining</strong><br>
       Hydrological data shows that upstream inflow began declining approximately 2 hours into the sensor outage as rainfall tapered off, reducing the rate of reservoir rise and decreasing the structural load on the dam during the critical monitoring gap.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; Redundant Seismic Sensors Operational</strong><br>
       The dam's independent seismic monitoring network — a separate system from the failed pressure and stress sensors — remained fully operational throughout the incident and detected no anomalous ground movement or vibration at any point during the outage.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; Operator Response Protocol Followed</strong><br>
       Post-incident review found that all steps in the dam operator's sensor outage response protocol were completed correctly and within prescribed time windows. The incident was subsequently used as a case study in the Army Corps of Engineers' annual dam safety training program.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; Comparable Outage Handled Successfully</strong><br>
       In 2018, the same facility experienced a shorter sensor outage (1 hour 45 minutes) during a period of similar reservoir conditions. That incident was managed with manual monitoring, no structural changes were detected, and the facility operated normally throughout.`
    ]
  },
 
  // 3 — Drinking water contamination
  3: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Contaminant Concentration Trend</strong><br>
       EPA laboratory records show that the detected chemical byproduct — a disinfection byproduct formed during water treatment — had been present in the distribution system at gradually increasing concentrations across four consecutive monthly tests before the advisory was issued, suggesting a developing process problem rather than an isolated event.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Proximity to Federal Action Level</strong><br>
       The highest concentration detected during the incident reached 78 micrograms per liter. The EPA's maximum contaminant level for this compound — the threshold at which regulatory action is legally required — is 80 micrograms per liter. The reading was 2.5% below the mandatory action threshold.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Vulnerable Population Exposure</strong><br>
       The affected distribution system serves three schools, two dialysis centers, and one hospital, all of which rely on municipal water for daily operations. Dialysis patients are among the populations with the highest sensitivity to disinfection byproduct exposure.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Treatment Process Fault</strong><br>
       Investigators identified the source of elevated byproduct formation as a malfunctioning chlorine dosing pump at the primary treatment plant that had been delivering approximately 40% above its target chlorine concentration for an estimated 11 days before the contamination was detected by routine testing.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Historical Analogue — Flint, Michigan</strong><br>
       The Flint water crisis, which resulted in elevated lead exposure for over 100,000 residents including children, was preceded by regulatory test results that approached but did not formally exceed federal action levels. Investigators in that case found that the threshold-based framework delayed protective action.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Detection Lag</strong><br>
       Under the utility's current testing schedule, distribution system samples are collected once per month. The 11-day gap between when the dosing pump malfunction likely began and when the elevated concentration was detected reflects the inherent delay in monthly sampling — a window during which residents were unknowingly consuming water with rising contaminant levels.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Treatment Plant Inspection Record</strong><br>
       State inspection records show the malfunctioning chlorine dosing pump had not been inspected in 14 months, exceeding the utility's own 12-month maintenance schedule. A state regulatory audit from the prior year had flagged the maintenance log as incomplete.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Long-Term Exposure Risk</strong><br>
       The class of disinfection byproducts involved is classified by the EPA as a probable human carcinogen. While short-term exposure at the concentrations detected carries low acute risk, epidemiological research links chronic exposure at or above the federal limit to increased rates of bladder and colorectal cancer.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; Advisory Notification Delay</strong><br>
       The EPA's advisory guidance recommends issuing public notification within 24 hours of receiving a confirmed exceedance reading. Investigators found that 31 hours elapsed between the laboratory confirming the elevated result and the utility issuing its public advisory, exceeding the recommended window.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Similar Incident at Nearby Utility</strong><br>
       A water utility 40 miles away issued a mandatory do-not-drink order in 2021 after a comparable dosing pump failure caused byproduct concentrations to exceed the federal action level before detection. That incident affected 28,000 customers for 72 hours.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; Routine Testing Caught the Problem</strong><br>
       The contamination was identified through the utility's standard monthly sampling program — the same program mandated under federal drinking water regulations. The system worked as designed: testing detected the rising concentration before it reached the mandatory action threshold.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; Contaminant Did Not Exceed Federal Limit</strong><br>
       All confirmed sample results remained below the EPA's maximum contaminant level of 80 micrograms per liter. Under federal drinking water standards, water at the detected concentration is not classified as unsafe and does not require a mandatory do-not-drink order.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; Dosing Pump Repaired Quickly</strong><br>
       Once the malfunctioning chlorine dosing pump was identified as the source, maintenance crews completed repairs within 6 hours. Post-repair testing confirmed chlorine dosing returned to target levels and byproduct formation began declining within 24 hours.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Distribution System Flushing</strong><br>
       The utility conducted a full distribution system flush within 18 hours of issuing the advisory, a procedure that accelerates the clearance of elevated byproduct concentrations from pipes and storage infrastructure. Follow-up testing confirmed concentrations had returned to baseline levels within 36 hours.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; Precautionary Advisory Issued Proactively</strong><br>
       The utility issued its precautionary bottled water advisory before concentrations reached the mandatory action threshold — a voluntary protective measure that exceeded minimum federal requirements and gave residents additional lead time.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; No Adverse Health Reports</strong><br>
       Over the 48-hour advisory period, neither the local health department nor regional hospital systems received any reports of illness attributable to drinking water exposure. Post-event surveillance through a 14-day follow-up period identified no associated health events.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; Bottled Water Distribution</strong><br>
       The city established four bottled water distribution points within 4 hours of issuing the advisory. Records show approximately 8,400 cases of bottled water were distributed to residents, with priority delivery arranged for the three schools and two dialysis centers in the affected zone.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; Regulatory Oversight Functioning</strong><br>
       State drinking water regulators were notified within 2 hours of the elevated test result being confirmed and conducted an on-site inspection of the treatment plant within 24 hours. The regulatory response was completed within all required timeframes under the Safe Drinking Water Act.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; Concentrations Declined Rapidly Post-Repair</strong><br>
       Testing conducted 48 hours after pump repair showed byproduct concentrations had fallen to 12 micrograms per liter — 85% below the pre-intervention peak — confirming that the dosing pump was the sole source and that no residual treatment issues remained.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; Infrastructure Investment Context</strong><br>
       The water utility had invested $14 million in treatment plant upgrades in the 3 years preceding the incident, including installation of a real-time chlorine monitoring system that provided the continuous data enabling rapid identification of the dosing pump fault.`
    ]
  },
 
  // 4 — Emergency alert system failure
  4: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Alert Delivery Failure Scope</strong><br>
       The 30% delivery failure rate affected approximately 2.4 million mobile devices across the three-state test area. Internal FEMA modeling estimates that in a real fast-onset emergency — such as a tornado warning with a 10-minute lead time — a failure of this magnitude would leave a population equivalent to a major metropolitan area without timely warning.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Root Cause: Unpatched Firmware</strong><br>
       FEMA engineers traced the failure to a firmware version running on a network of cell broadcast servers that had not been updated in 22 months. A compatibility update addressing the affected transmission protocol had been issued by the vendor 8 months earlier and had not been applied.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Disproportionate Impact on Rural Areas</strong><br>
       Post-incident analysis found that the delivery failure was not uniformly distributed: rural areas relying on older cellular infrastructure experienced failure rates as high as 61%, while urban areas with more recent tower equipment averaged 14%. Rural populations are often more dependent on mobile alerts as their primary warning mechanism.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Historical Death Toll Context</strong><br>
       A 2011 study of tornado fatalities found that residents who received advance warning had fatality rates approximately 70% lower than those who did not. The Joplin, Missouri tornado of that year — which killed 158 people — struck in part because early alerts did not reach all residents in time.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Prior Test Anomalies Not Acted Upon</strong><br>
       Delivery verification reports from two prior monthly test broadcasts in the same region had shown elevated non-delivery rates of 8% and 12% respectively. FEMA records show no maintenance action was initiated in response to either anomalous result before the 30% failure occurred.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Alert System Upgrade Delay</strong><br>
       The planned system-wide upgrade that FEMA was urged to accelerate following the incident had originally been scheduled for completion 2 years prior. It was delayed first by procurement issues and then by congressional budget negotiations, resulting in a 26-month gap beyond the original completion date.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Vulnerable Population Reliance</strong><br>
       Wireless Emergency Alerts are the primary warning mechanism for approximately 34% of U.S. households that have discontinued landline telephone service. For these households — disproportionately younger, lower-income, and in multifamily housing — no equivalent fallback notification system currently exists.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Failure Detection Time</strong><br>
       Although the failure was identified within minutes, post-incident analysis found this was only possible because it occurred during a scheduled test with pre-established delivery confirmation infrastructure. FEMA has no real-time delivery monitoring capability for operational (non-test) alert broadcasts; a real-world failure of this type would not have been detected until after the event.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; Cellular Carrier Coordination Gap</strong><br>
       Three of the seven cellular carriers responsible for transmitting the alert in the affected region had not participated in the most recent inter-agency coordination exercise. Post-incident interviews found that two of the three had implemented network changes since the exercise that affected alert routing without notifying FEMA.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Hawaii False Alert Precedent</strong><br>
       The 2018 Hawaii false missile alert — which sent 1.3 million residents into panic for 38 minutes — revealed systemic vulnerabilities in alert infrastructure that FEMA committed to addressing in a remediation plan. A review conducted after this incident found 4 of the 11 planned remediation measures were still incomplete.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; No Real Emergency Active</strong><br>
       The failure occurred during a scheduled test broadcast with no concurrent emergency condition. FEMA's policy of conducting regular tests specifically to identify system vulnerabilities before they affect real warnings worked as intended — this gap was discovered in a controlled environment.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; 70% Delivery Rate Maintained</strong><br>
       Despite the failure, approximately 70% of targeted devices successfully received the test alert within the standard 4-minute delivery window, consistent with the system's designed minimum performance threshold for degraded operations.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; Rapid Failure Identification</strong><br>
       FEMA's post-broadcast delivery monitoring system identified the elevated non-delivery rate within 6 minutes of the broadcast completing, enabling immediate escalation to engineering staff for root cause analysis.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Multiple Redundant Warning Channels</strong><br>
       The Wireless Emergency Alert system is one of four parallel notification channels in the Integrated Public Alert and Warning System (IPAWS), alongside broadcast television, radio, and NOAA weather radio. In a real emergency, all four would be activated simultaneously, providing redundancy against any single channel failure.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; Firmware Patch Applied Within 72 Hours</strong><br>
       Following identification of the root cause, FEMA coordinated with the affected cell broadcast server operators to apply the outstanding firmware update across all impacted infrastructure in the three-state region within 72 hours, restoring full delivery capability.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; System Performance Improving Over Time</strong><br>
       FEMA testing records show that average nationwide Wireless Emergency Alert delivery rates have improved from 71% in 2019 to 87% in the year prior to this incident, reflecting ongoing infrastructure investments and carrier compliance improvements.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; Comparable Test Incident Successfully Managed</strong><br>
       A similar delivery failure — affecting 22% of devices in two states — was identified during a 2020 test broadcast. That incident led to a firmware audit and targeted infrastructure upgrades that increased average delivery rates by 9 percentage points in the affected region.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; Local Warning Infrastructure Independent</strong><br>
       All three affected states operate independent outdoor siren networks and have active broadcast media emergency alert agreements that function entirely separately from the Wireless Emergency Alert system. These systems were unaffected by the mobile delivery failure.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; Congressional Funding Secured</strong><br>
       Three months before this incident, Congress passed an appropriations bill that fully funded the pending IPAWS infrastructure upgrade, including the cell broadcast server modernization that would address the firmware vulnerability. Deployment was already contracted and underway.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; International Benchmark Performance</strong><br>
       A comparative analysis of emergency alert delivery rates across G7 nations found that the U.S. system's average delivery performance during the year prior to this incident ranked second among the seven countries, behind Japan's J-Alert system.`
    ]
  },
 
  // 5 — Hospital network cyberattack
  5: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Prior Audit Findings Not Resolved</strong><br>
       A federal cybersecurity audit conducted 14 months before the attack identified 23 vulnerabilities in the hospital network's administrative IT systems, rated 6 as high-severity, and recommended remediation within 90 days. Post-incident review found that 4 of the 6 high-severity vulnerabilities had not been fully remediated at the time of the attack.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Ransomware Entry Vector</strong><br>
       Forensic analysis traced the ransomware entry point to a phishing email opened on an administrative workstation that was running an operating system version no longer receiving security updates. IT records show the workstation had been flagged for operating system upgrade 8 months prior; the upgrade had been deferred due to budget scheduling.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Clinical System Proximity</strong><br>
       While clinical records remained secure, investigators found that the network segmentation between administrative and clinical systems relied on a single firewall rule set that had not been audited in 19 months. Three hospital security experts who reviewed the architecture rated the risk of lateral movement to clinical systems as "moderate to high" had the attack persisted another 6 hours.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Patient Safety Impact of System Downtime</strong><br>
       Peer-reviewed research published in JAMA Network Open found that hospitals operating under electronic health record downtime — comparable to the 18-hour administrative outage — experience a statistically significant increase in diagnostic error rates and medication reconciliation failures during the affected period.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Historical Ransomware Fatality</strong><br>
       A 2020 ransomware attack on Düsseldorf University Hospital in Germany is considered the first confirmed case of a patient death attributable to a hospital cyberattack, after a critical care patient had to be rerouted to a more distant hospital during system downtime. The incident received international attention among healthcare cybersecurity specialists.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Backup System Recovery Time</strong><br>
       The hospital network's encrypted backup systems, which should have enabled faster recovery, had not been tested with a full restore drill in 27 months. IT staff encountered compatibility issues during the actual restore process that added an estimated 4 hours to the recovery timeline.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Staff Cybersecurity Training Gap</strong><br>
       The phishing email that delivered the ransomware payload was flagged as suspicious by the network's email filter but was not quarantined because the filter's threat signatures had not been updated in 6 weeks. Additionally, the employee who opened the email had not completed the annual cybersecurity awareness training that was due 3 months earlier.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Attack Dwell Time</strong><br>
       Forensic analysis determined that the ransomware had been present in the network for approximately 9 days before it was activated, during which time it mapped network architecture and encrypted backup pathways. The extended dwell time was not detected by the network's intrusion detection system.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; Sector-Wide Attack Trend</strong><br>
       The Department of Health and Human Services reported 386 significant ransomware attacks on U.S. healthcare organizations in the 12 months preceding this incident — an increase of 41% from the prior year — making healthcare the most frequently targeted critical infrastructure sector.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Financial Recovery Pressure</strong><br>
       The 18-hour billing and scheduling outage resulted in an estimated $2.4 million in delayed billing processing and rescheduling costs for the hospital network. Investigators noted that financial pressure from such incidents has historically led some hospital networks to pay ransoms rather than restore from backups, potentially funding further attacks.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; Clinical Systems Fully Isolated</strong><br>
       Network segmentation successfully prevented the ransomware from reaching any system containing patient health records, diagnostic equipment interfaces, or medication dispensing systems. Clinical operations continued without interruption throughout the 18-hour incident.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; Incident Response Plan Activated</strong><br>
       The hospital network's cybersecurity incident response plan was activated within 22 minutes of the attack being detected. All planned response steps — network isolation, law enforcement notification, backup initiation, and public communication — were completed within prescribed timeframes.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; Backup Restoration Successful</strong><br>
       All affected administrative systems were fully restored from encrypted backups within 18 hours. No patient data was lost or compromised. The hospital network declined to pay the ransom, and all systems were restored exclusively through internal recovery procedures.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Patient Care Continuity</strong><br>
       Hospital clinical staff successfully implemented paper-based downtime procedures for all 14 hours that electronic scheduling and order entry systems were unavailable. Post-incident clinical review found no patient care events attributable to the system downtime.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; Rapid Attacker Containment</strong><br>
       The network security team isolated the affected administrative subnet within 34 minutes of detecting the attack, containing the ransomware's spread before it could reach the payroll, credentialing, or medical device management systems also connected to the administrative network.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; Law Enforcement Coordination</strong><br>
       The FBI's Cyber Division was notified within 2 hours of the attack, provided technical assistance throughout the response, and subsequently identified the ransomware variant as one used by a known threat actor whose tools the FBI had decryption keys for — enabling faster system restoration.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; Recent Security Improvements</strong><br>
       In the 12 months before the attack, the hospital network had implemented multi-factor authentication across all remote access points, deployed an endpoint detection and response platform on clinical workstations, and conducted two tabletop cybersecurity exercises — measures that limited the attack's reach.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; No Patient Data Exfiltrated</strong><br>
       Forensic analysis confirmed that the ransomware operator did not exfiltrate any patient health information, financial records, or employee data before activating the encryption payload. The attack was purely disruptive rather than a data breach, avoiding HIPAA breach notification obligations.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; Staff Response Performance</strong><br>
       Post-incident interviews with clinical and IT staff found that downtime response procedures were followed correctly across all four hospital facilities in the network. Three of the four facilities had conducted a downtime drill within the prior 18 months.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; Peer Institution Comparison</strong><br>
       A 2023 benchmark study found that the average hospital network recovery time from a ransomware attack of comparable scope was 44 hours. This network's 18-hour recovery time placed it in the top quartile of incident response performance among comparable healthcare organizations.`
    ]
  },
 
  // 6 — Railroad signal failure
  6: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Time to Collision Estimate</strong><br>
       NTSB modeling found that at the speeds both trains were traveling when the signal failure routed them onto the same segment, they would have collided approximately 6 minutes and 20 seconds after the erroneous signal was issued, had operators not intervened. Dispatch identified the conflict and halted both trains with an estimated 90 seconds to spare.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Cargo Hazard Assessment</strong><br>
       One of the two freight trains involved was carrying 18 tank cars loaded with anhydrous ammonia, a toxic industrial chemical. A high-speed collision involving loaded ammonia tank cars has the potential to generate a toxic vapor cloud requiring evacuation of a large surrounding area.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Signal System Maintenance History</strong><br>
       Federal Railroad Administration records show the specific signal relay that failed had been in continuous service for 34 years — 9 years beyond the manufacturer's recommended replacement interval. It had generated fault codes during two prior inspection cycles; both were logged but no replacement work order was issued.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Positive Train Control Coverage Gap</strong><br>
       The track segment where the conflict occurred was among the 12% of the U.S. freight rail network not yet covered by Positive Train Control (PTC) — the automated system that would have detected the conflicting signal and automatically halted both trains without dispatcher intervention.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Historical Precedent</strong><br>
       The 2008 Chatsworth rail collision in California — which killed 25 people — resulted from a signal system failure combined with dispatcher communication breakdown on a similar non-PTC corridor. The NTSB cited identical contributing factors in its preliminary review of this incident.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Detection Delay</strong><br>
       The signal failure was not detected by the railroad's centralized traffic control system for 3 minutes and 40 seconds after it occurred, because the erroneous signal displayed green rather than triggering a system fault alert. During that window, both trains continued accelerating toward the shared segment.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Prior Incident on Same Corridor</strong><br>
       A less severe signal discrepancy on the same corridor 18 months earlier had resulted in two trains being simultaneously cleared for the same passing siding. That incident was resolved without incident but was classified as a Level 2 safety event. The root cause analysis recommended signal relay inspection; records show the recommendation was not acted upon.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Dispatcher Workload</strong><br>
       The dispatcher who identified the conflict was simultaneously managing traffic on three other corridor segments, which the railroad's own fatigue and workload management guidelines classify as the maximum safe concurrent assignment. Post-incident analysis found the dispatcher's workload may have contributed to the 3-minute 40-second detection delay.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; Track Geometry at Conflict Point</strong><br>
       The segment where the signal failure placed both trains was a curved section with restricted sight lines, meaning train crews would not have had visual confirmation of an oncoming train until they were approximately 0.3 miles apart — insufficient stopping distance at normal freight operating speeds.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Deferred Safety Upgrade</strong><br>
       The railroad operator had applied for a congressional exemption from PTC installation requirements on this corridor in 2021, citing capital cost constraints. The exemption was granted for a 3-year period. The incident occurred during that exemption window.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; Dispatcher Intervention Successful</strong><br>
       The dispatcher identified the routing conflict through centralized traffic control monitoring and issued emergency stop commands to both trains. Both crews responded immediately and brought their trains to a complete stop with an estimated 90 seconds before the projected collision point.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; Emergency Brake Performance</strong><br>
       Both freight trains were equipped with electronically controlled pneumatic braking systems, which reduce stopping distances by approximately 40–60% compared to conventional air brakes. Post-incident analysis confirmed both braking systems performed within design specifications.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; No Derailment or Damage</strong><br>
       Both trains came to a complete stop without derailment, cargo displacement, or any equipment damage. All 47 loaded tank cars remained on track and sealed throughout the emergency stop procedure.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Dispatcher Training Performance</strong><br>
       The dispatcher who identified the conflict had completed the railroad's emergency traffic management simulation training 4 months before the incident, including a scenario specifically involving conflicting clearances on a single-track segment. Post-incident review praised the speed and accuracy of the intervention.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; Crew Communication Protocol Followed</strong><br>
       Both train crews acknowledged the stop command within 12 seconds of receiving it and confirmed their train status via radio within 2 minutes of stopping. All required safety communications were completed in accordance with FRA operating rules.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; Track Segment Cleared and Verified</strong><br>
       After both trains were confirmed stopped, a track inspection was completed within 45 minutes, the faulty signal relay was identified and isolated, and the corridor was cleared for resumed operations under manual block authority — a backup procedure that allows safe train movement without relying on automated signaling.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; Redundant Position Tracking</strong><br>
       Although PTC was not installed on this corridor, the centralized traffic control system provides real-time position tracking for all trains based on track circuit occupancy. This independent layer of position monitoring enabled the dispatcher to confirm both trains' locations throughout the incident.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; Industry Safety Improvement Trend</strong><br>
       FRA data shows that the rate of train-to-train collisions on U.S. freight railroads has declined by 64% over the past 20 years, from 0.89 incidents per million train-miles in 2003 to 0.32 in the year preceding this incident, reflecting sustained safety improvements across the industry.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; Comparable Incident Resolved Successfully</strong><br>
       In 2022, a signal failure on a different single-track freight corridor created a similar head-on routing conflict. The dispatcher on duty identified the error within 2 minutes and halted both trains before they entered the shared segment. No contact was made and no injuries occurred.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; Signal Relay Replaced and System Audited</strong><br>
       The failed signal relay was replaced within 48 hours of the incident. The railroad subsequently commissioned an audit of all signal components on the affected corridor that exceeded their recommended replacement interval, identifying 14 additional components for near-term replacement.`
    ]
  },
 
  // 7 — Nuclear plant monitoring error
  7: {
    vulnerabilityTexts: [
      `<strong>Record V-1 &nbsp;|&nbsp; Duration of Erroneous Readings</strong><br>
       The firmware error caused automated sensors to report normal coolant temperature and pressure values for approximately 6 hours while actual conditions went unverified. Investigators noted that if a developing abnormality had been present, the standard automated response protocols would not have been triggered during this window.`,
 
      `<strong>Record V-2 &nbsp;|&nbsp; Number of Affected Sensors</strong><br>
       The firmware error affected 14 of the plant's 31 primary monitoring sensors, including 5 that track reactor coolant system parameters classified as safety-significant under NRC regulations. All 5 were simultaneously providing readings of uncertain validity for the duration of the incident.`,
 
      `<strong>Record V-3 &nbsp;|&nbsp; Delayed Switch to Manual Monitoring</strong><br>
       NRC operating procedures require operators to initiate manual monitoring protocols within 30 minutes of identifying a safety-significant instrument malfunction. Investigators found that 1 hour and 47 minutes elapsed between the firmware error beginning and operators switching to manual monitoring — a compliance gap of approximately 77 minutes.`,
 
      `<strong>Record V-4 &nbsp;|&nbsp; Historical Precedent — Three Mile Island</strong><br>
       The 1979 Three Mile Island accident — the most serious nuclear incident in U.S. history — was substantially caused by operators receiving misleading readings from a stuck indicator light. The NRC has emphasized in post-TMI guidance that instrument failures affecting reactor safety parameters must be treated as potential precursors to abnormal conditions.`,
 
      `<strong>Record V-5 &nbsp;|&nbsp; Expert Safety Assessment</strong><br>
       A nuclear safety engineer retained by the investigating committee stated that while actual plant conditions were normal throughout the incident, the combination of compromised sensor data and delayed procedural response created a monitoring gap that, in the presence of a concurrent developing fault, could have delayed emergency response by a safety-significant margin.`,
 
      `<strong>Record V-6 &nbsp;|&nbsp; Firmware Update Validation Gap</strong><br>
       The firmware version that contained the error had been deployed to production monitoring systems following a validation process that did not include a full simulation of sensor behavior under all classified operating conditions. The NRC's post-incident review found the validation protocol did not meet the standard applicable to safety-significant software changes.`,
 
      `<strong>Record V-7 &nbsp;|&nbsp; Sector-Wide Firmware Vulnerability</strong><br>
       The NRC issued a generic communication to all U.S. nuclear operators following this incident, noting that 9 other facilities used the same monitoring software version. Subsequent inspections found that 3 of the 9 had the same firmware installed and had not yet applied the corrective update.`,
 
      `<strong>Record V-8 &nbsp;|&nbsp; Operator Fatigue Factor</strong><br>
       The shift supervisor on duty when the firmware error began had been on shift for 9 hours and 20 minutes. NRC fatigue rule guidelines flag elevated attention requirements for operators exceeding 8 hours of continuous duty. Post-incident review noted this as a potential contributing factor in the delayed switch to manual monitoring.`,
 
      `<strong>Record V-9 &nbsp;|&nbsp; Similar Incident at Another Facility</strong><br>
       A 2019 NRC inspection report documented a comparable sensor firmware error at a different U.S. nuclear facility that went undetected for 3 hours. That incident was resolved without consequence but resulted in a Notice of Violation citing inadequate software change controls — the same root cause identified in this incident.`,
 
      `<strong>Record V-10 &nbsp;|&nbsp; Corrective Action Program Backlog</strong><br>
       The plant's corrective action program had an open item, logged 11 months before the incident, recommending an audit of safety-significant sensor software versions following an industry alert about firmware compatibility issues. The audit had not been completed at the time of the incident.`
    ],
    resilienceTexts: [
      `<strong>Record R-1 &nbsp;|&nbsp; Reactor Conditions Normal Throughout</strong><br>
       Independent post-incident verification using the plant's redundant hardwired safety instrumentation — a separate system unaffected by the firmware error — confirmed that all reactor parameters remained within normal operating bounds during the entire 6-hour monitoring gap.`,
 
      `<strong>Record R-2 &nbsp;|&nbsp; Multiple Independent Monitoring Layers</strong><br>
       U.S. nuclear plants are required to maintain at least four independent measurement channels for all safety-significant parameters. The firmware error affected one of four channels for the impacted sensors. The remaining three channels continued providing valid readings and were cross-checked by operators during the manual monitoring period.`,
 
      `<strong>Record R-3 &nbsp;|&nbsp; Manual Monitoring Protocol Effective</strong><br>
       Once operators switched to manual monitoring, licensed reactor operators performed direct parameter checks at 15-minute intervals at plant instrumentation panels. All readings confirmed normal conditions. No abnormal trend was identified during the manual monitoring period.`,
 
      `<strong>Record R-4 &nbsp;|&nbsp; Physical Safety Systems Unaffected</strong><br>
       The firmware error was confined to the data acquisition and display software layer. All physical safety systems — including emergency core cooling systems, containment isolation valves, and reactor trip breakers — remained fully functional and were not controlled or affected by the compromised software.`,
 
      `<strong>Record R-5 &nbsp;|&nbsp; No Radiation Release</strong><br>
       Continuous environmental radiation monitoring at the plant boundary and at four offsite monitoring stations recorded no deviation from background radiation levels throughout the incident. Post-incident sampling of air, water, and soil in the surrounding area confirmed no release of radioactive material.`,
 
      `<strong>Record R-6 &nbsp;|&nbsp; Root Cause Identified and Corrected Rapidly</strong><br>
       Plant software engineers identified the specific firmware version causing the error within 2 hours of the issue being escalated and deployed a validated corrective patch to all affected monitoring units within 4 hours, restoring full automated monitoring capability.`,
 
      `<strong>Record R-7 &nbsp;|&nbsp; NRC Resident Inspector On-Site</strong><br>
       The NRC's resident inspector assigned to the facility was on-site during the incident, received real-time notification when operators switched to manual monitoring, and independently verified plant status at multiple points during the event. The inspector assessed conditions as stable throughout.`,
 
      `<strong>Record R-8 &nbsp;|&nbsp; Defense-in-Depth Architecture Validated</strong><br>
       The incident demonstrated the effectiveness of nuclear safety's defense-in-depth design philosophy: the software monitoring layer failed, but the physical safety systems, redundant instrumentation channels, manual operator procedures, and on-site regulatory oversight all functioned as designed, providing multiple independent safety barriers.`,
 
      `<strong>Record R-9 &nbsp;|&nbsp; U.S. Nuclear Safety Record</strong><br>
       The U.S. nuclear industry has operated for over 40 years since the Three Mile Island incident without a core damage event. The NRC's most recent annual safety performance review rated 92 of 93 operating U.S. reactors as meeting all safety performance indicators.`,
 
      `<strong>Record R-10 &nbsp;|&nbsp; Prompt Regulatory Reporting</strong><br>
       The plant submitted a Licensee Event Report to the NRC within the required 60-day window, fully disclosing the firmware error, the delayed procedure entry, and the corrective actions taken. The NRC's review found the self-identification and reporting process functioned appropriately.`
    ]
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