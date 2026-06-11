var jsPsychSelectionLearning = (function (jspsych) {
	"use strict";

	/**
	 * **SELECTION LEARNING**
	 *
	 * SHORT PLUGIN DESCRIPTION
	 *
	 * @author Nathan Liang and Jane Acierno
	 * @see {@link https://DOCUMENTATION_URL DOCUMENTATION LINK TEXT}
	 */

	// Default values for images / labels: ["image1", "image2", ..., "imageN"]
	const defaultImages = [...Array(20)].map((_, i) => `image${i + 1}`);
	const defaultLabels = [...Array(20)].map((_, i) => `label${i + 1}`);

	const info = {
		name: "selection-learning",
		parameters: {
			selection_learning: {
				type: jspsych.ParameterType.IMAGE,
				default: defaultImages
			},
			selection_labels: {
				type: jspsych.ParameterType.HTML_STRING,
				default: defaultLabels
			},
			choices: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "Choices",
				default: undefined,
				array: true,
			},
			resilienceTexts: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "Resilience texts",
				default: ["R1","R2","R3","R4","R5","R6","R7","R8","R9","R10"],
				array: true,
			},
			vulnerabilityTexts: {
				type: jspsych.ParameterType.STRING,
				pretty_name: "Vulnerability texts",
				default: ["V1","V2","V3","V4","V5","V6","V7","V8","V9","V10"],
				array: true,
			}
		}
	};
	class SelectionLearningPlugin {
		constructor(jsPsych) {
			this.jsPsych = jsPsych;
		};

		trial(display_element, trial) {
            display_element.innerHTML += `
			<div id="jspsych-instructions">
				<div id="jspsych-selection-advance-btngroup" style="text-align:right; margin-bottom: 12px;"></div>
                    <div class="quote">
                        <h2>Additional Information</h2>
                        <p>Investigators have released additional information about the incident.
						Which information would you like to view?</p>
						<p>You can view as many records as you like before moving on.</p>
					</div>
				</div>` +
				`<div id="trial-presentation-space" class="popup"></div><div id="overlay"></div>` +
				`<div id="prompt-container"></div>` +
				`<div class="grid-container-wrapper">
					<div class="grid-container" id="avatar-grid"></div>
				</div>`;


			// Initialize trial presentation space
			const trialPresentationSpace = $('#trial-presentation-space');

			// Generate circles
			const avatarCircleContainer = $('#avatar-grid');

			// Shuffle helper
			function shuffleArray(array) {
				for (let i = array.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[array[i], array[j]] = [array[j], array[i]];
				}
				return array;
			}

			// Build slots: each slot bundles avatarNumber + recordType + responseText + label together
			// so shuffling the slots can never decouple a label from its response text.
			// Text arrays come from trial parameters so each statement can have unique records.
			const resilienceTexts = trial.resilienceTexts;
			const vulnerabilityTexts = trial.vulnerabilityTexts;

			let slots = [
				...resilienceTexts.map((text, i) => ({
					avatarNumber: i + 1,
					recordClass: 'avatar-circle-resilience',
					label: 'Resilience',
					responseText: text
				})),
				...vulnerabilityTexts.map((text, i) => ({
					avatarNumber: i + 11,
					recordClass: 'avatar-circle-vulnerability',
					label: 'Vulnerability',
					responseText: text
				}))
			];

			// Shuffle slots so grid order is randomized — mapping is preserved because
			// avatarNumber, label, and responseText all travel together in each slot object.
			slots = shuffleArray(slots);

			// Derive legacy parallel arrays from slots (used in data recording and click handlers)
			const avatarNumberArray = slots.map(s => s.avatarNumber);
			const combinedRecordArray = slots.map(s => s.recordClass);
			const recordLabels = slots.map(s => s.label);
			const responseTexts = slots.map(s => s.responseText);

			// Render the avatar grid
			for (let i = 0; i < slots.length; i++) {
				const slot = slots[i];
				const avatarCircleWrapper = $(`<div class='avatar-circle-wrapper'></div>`);
				const avatarCircle = $(`<div class='avatar-circle clickable ${slot.recordClass}' id='circle${slot.avatarNumber}'></div>`);
				avatarCircleWrapper.append(avatarCircle);
				avatarCircleContainer.append(avatarCircleWrapper);
				const avatarPhoto = $(`<img class='avatar-photo' src='./avatars/avatar${slot.avatarNumber}.webp'>`);
				const label = $(`<div class='record-label'>${slot.label}</div>`);
				avatarCircle.append(avatarPhoto);
				avatarCircleWrapper.append(label);
			}

			// Define resilienceArray and vulnerabilityArray
			const resilienceArray = combinedRecordArray.filter(record => record === 'avatar-circle-resilience');
			const vulnerabilityArray = combinedRecordArray.filter(record => record === 'avatar-circle-vulnerability');
			
			// Pt. 3: Prompt
			const samplingPromptContainer = $('#prompt-container');
			samplingPromptContainer.html(`
				<strong id="samplingPrompt" style="text-transform: uppercase;">
					click on a record below
				</strong>
				<br>
				<span style="text-transform: uppercase;">
					(scroll to view more)
				</span>
				<br>`
			);
			
			trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';

			let recordType = [];
			let avatarSelections = [];
			let avatarPositionIndices = [];
			let avatarPositionXIndices = [];
			let avatarPositionYIndices = [];

			// Reaction times for clicking on boxes
			let clickRtArray = [];

			// Reaction times for viewing each box
			let viewRtArray = [];

			let selectedresponseTexts = [];

			var advanceButton = `<button class="jspsych-btn">I don't want to view any records</button>`
			$('#jspsych-selection-advance-btngroup').append(
				$(advanceButton).attr('id', 'jspsych-selection-advance-btn')
					.data('choice', 1)
					.addClass('jspsych-selection-advance-btn')
					.on('click', function (e) {
						endTrial();
					})
			);

			let startTime = (new Date()).getTime();

			const initLearning = (avatarIndex, avatarNumber) => {
				// RT: START STOPWATCH (VIEW)
				let viewTic = (new Date()).getTime();
			
				$('#overlay').fadeIn();
				trialPresentationSpace.empty();
				trialPresentationSpace.fadeIn();
			
				const trialFormat     = $(`<div id="trial-format"></div>`);
				const trialFeedback   = $(`<div id="selection-buttons"></div>`);
				const avatarContainer = $('<div id="avatar-container"></div>')
			
				// Create a new circle to hold the chosen avatar
				// Add it to the presentation space
				const avatarCircleSelection = $('<div></div>', {
					class: 'avatar-circle-wrapper',
					id: `circle${avatarNumber}`
				}).appendTo(avatarContainer);
			
				const avatarCircle = $('<div></div>', {
					class: 'avatar-circle',
					id: `circle${avatarNumber}`
				}).appendTo(avatarCircleSelection);
			
				avatarCircle.addClass(combinedRecordArray[avatarNumberArray.indexOf(avatarNumber)]);
			
				// Create copy of the chosen avatar photo
				// Add it inside the avatar circle
				$('<img>', {
					src: `./avatars/avatar${avatarNumber}.webp`,
					class: 'avatar-photo'
				}).appendTo(avatarCircle);
			
				// Add the specific label for the avatar, ensuring it matches the label in the grid
				const specificLabel = recordLabels[avatarNumberArray.indexOf(avatarNumber)];
				const specificLabelElement = $(`<div class='specific-label'>${specificLabel}</div>`);
				avatarCircleSelection.append(specificLabelElement);
			
				const responseDisplay = $(`
					<div class="avatar-response"
						style="
							margin-top:20px;
							padding:20px;
							border:1px solid #ccc;
							border-radius:8px;
							font-size:1.2em;
							text-align:center;
        				">
      		  			${responseTexts[avatarIndex]}
  		  			</div>
				`);
			
				trialFormat.append(avatarContainer, responseDisplay);
				trialPresentationSpace.html(`<div></div>`);
				trialPresentationSpace.append(trialFormat);
			
				samplingPromptContainer.empty();
				avatarCircleContainer.addClass('fade-out-partial');
			
				setTimeout(function () {
					let buttons = [];
					if (Array.isArray(trial.button_html)) {
						if (trial.button_html.length == trial.choices.length) {
							buttons = trial.button_html;
						}
					} else {
						for (let i = 0; i < trial.choices.length; i++) {
							buttons.push(trial.button_html);
						}
					}
					trialPresentationSpace.html(trialFormat);
			
					trialFeedback.html(`
						<hr></hr>
						<p>Would you like to view another record?</p>
						<div id="jspsych-selection-learning-btngroup" class="center-content block-center"></div>`
					);
			
					trialPresentationSpace.append(trialFeedback);
			
					for (let l = 0; l < trial.choices.length; l++) {
						var str = buttons[l].replace(/%choice%/, trial.choices[l]);
						$('#jspsych-selection-learning-btngroup').append(
							$(str).attr('id', 'jspsych-selection-learning-button-' + l)
								.data('choice', l)
								.addClass('jspsych-selection-learning-button')
								.on('click', function (e) {
			
									// disable all the buttons after a response
									$('.jspsych-selection-learning-button').off('click')
										.attr('disabled', 'disabled');
			
									// hide button
									$('.jspsych-selection-learning-button').hide();
									let choice = $('#' + this.id).data('choice');
								})
						);
					}
					$('#jspsych-selection-learning-button-0').on('click', function (e) {
						let viewToc = (new Date()).getTime();
						let viewRt = viewToc - viewTic;
						viewRtArray.push(viewRt);
			
						// RT: STOP STOPWATCH (CLICK)
						let clickToc = (new Date()).getTime();
						let clickRt = clickToc - (startTime + clickRtArray.reduce((acc, curr) => acc + curr, 0) + viewRtArray.reduce((acc, curr) => acc + curr, 0));
						clickRtArray.push(clickRt);
						
						$('#overlay').fadeOut();
						trialPresentationSpace.html(`<div id="trial-format"></div><div id="selection-format"></div>`);
						trialPresentationSpace.empty().hide();
						trialFormat.html(`<div id="trial-format"></div>`);
						trialFeedback.html('<div id="selection-buttons"></div>');
			
						// Fade the prompt back in
						samplingPromptContainer.html(
							`<p id="samplingPrompt" style="text-transform: uppercase;">
								<strong>click on an investigator to view their record</strong><br>
								(scroll to view more)
							</p>`
						);
			
						// Fade the grid back in
						avatarCircleContainer.removeClass('fade-out-partial')
							.addClass('fade-in');
						reattachEventListeners();
					});
			
					$('#jspsych-selection-learning-button-1').on('click', function (e) {
						// RT: STOP STOPWATCH (VIEW)
						let viewToc = (new Date()).getTime();
						let viewRt  = viewToc - viewTic;
						viewRtArray.push(viewRt);
			
						// RT: STOP STOPWATCH (CLICK)
						let clickToc = (new Date()).getTime();
						if (clickRtArray.length === 0) {
							var clickRt = clickToc - (startTime + viewRtArray.reduce((acc, curr) => acc + curr, 0));
						}
						else { 
							var clickRt = clickToc - (startTime + clickRtArray.reduce((acc, curr) => acc + curr, 0) + viewRtArray.reduce((acc, curr) => acc + curr, 0));
						}
			
						clickRtArray.push(clickRt);
						endTrial();
					});
			
				}, 1000); 
			};
			const clickHandlers = {};
			let currentSelection = null; // Track the current selection
			
			for (let avatarIndex = 0; avatarIndex < 20; avatarIndex++) {
				(function (i) {
					let avatarNumber = avatarNumberArray[avatarIndex]; // use shuffled slot order, not avatarIndex+1
					let isLearningInProgress = false; // Flag variable
					const clickHandler = function () {
						if (currentSelection !== avatarNumber && !isLearningInProgress && !this.classList.contains('disabled')) {
							isLearningInProgress = true; // Set flag to indicate learning is in progress
			
							let currentIndex; 
							let Record;
			
							// <!-- Find actual index of the avatar --> //
							avatarSelections.push(avatarNumber); // Push circle index to selections
							selectedresponseTexts.push(responseTexts[avatarIndex]); // Push selected responses to selections
							currentSelection = avatarNumber; // Update current selection
			
							currentIndex = avatarNumberArray.indexOf(currentSelection);
							Record = combinedRecordArray[currentIndex];
							recordType.push(Record);
			
							// <!-- Find positional index of the avatar --> //
							// Assuming you have an ID or a class for the parent div
							var parentDiv = document.getElementById('avatar-grid'); // or use document.querySelector if you have a class
							var childDivs = parentDiv.children; // or parentDiv.querySelectorAll('div') if you need a more specific selector
			
							// Function to find the index of a specific sub-div
							function findSubDivIndex(subDivId) {
								for (var i = 0; i < childDivs.length; i++) {
									if (childDivs[i].id === subDivId) { // or use another property to identify the sub-div
										return i; // Returns the index of the sub-div
									};
								};
								return -1; // Return -1 if the sub-div is not found
							};
			
							let avatarPositionIndex = findSubDivIndex('circle' + avatarNumber);
							avatarPositionIndices.push(avatarPositionIndex);
			
							let avatarPositionXIndex = avatarPositionIndex % 4;
							avatarPositionXIndices.push(avatarPositionXIndex);
			
							let avatarPositionYIndex = Math.floor(avatarPositionIndex / 4);
							avatarPositionYIndices.push(avatarPositionYIndex);
			
							// Disable other circles
							for (let j = 1; j <= 20; j++) {
								if (j !== i) {
									$("#circle" + j).addClass('disabled');
								};
							};
			
							$("#circle" + avatarNumber).css("background-color", "#bbb");  // Fades background color
							if (combinedRecordArray[avatarNumberArray.indexOf(avatarNumber)] === "avatar-circle-resilience") {
								$("#circle" + avatarNumber).css("border-color", "rgba(128, 130, 135, 0.5)");
							} else {
								$("#circle" + avatarNumber).css("border-color", "rgba(128, 130, 135, 0.5)");
							};
							$("#circle" + avatarNumber).find("img.avatar-photo").css("opacity", "0.5");  // Fades avatar photo
							initLearning(avatarIndex, avatarNumber);  // Start trial
							isLearningInProgress = false;
						};
					};
			
					$("#circle" + avatarNumber).on('click', clickHandler);
					clickHandlers[avatarIndex] = clickHandler;
			
					startTime = (new Date()).getTime(); // Store the start time
				})(avatarIndex);
			};
			
			// Function to reattach event listeners
			function reattachEventListeners() {
				for (let i = 1; i <= 20; i++) {
					$("#circle" + i).removeClass('disabled');
				};
				currentSelection = null; // Reset current selection for new phase
			};

			const endTrial = () => {
				const finalTime = (new Date()).getTime();
				const taskDuration = finalTime - startTime;
				const trial_data = {
				  "statement": trial.statement, //Collect statement information
				  "avatar_selections": avatarSelections.join(','), // Collect avatar selections
				  "avatar_position_indices": avatarPositionIndices.join(','),
				  "avatar_position_x_indices": avatarPositionXIndices.join(','),
				  "avatar_position_y_indices": avatarPositionYIndices.join(','),
				  "all_avatars": combinedRecordArray,
				  "resilience_records": resilienceArray,
				  "vulnerability_records": vulnerabilityArray,
				  "selected_response_text": selectedresponseTexts,
				  "record_type": recordType.join(','), // Collect record type
				  "avatar_professions": recordLabels.join(','), // Collect profession information
				  "click_rt_array": clickRtArray.join(','),
				  "view_rt_array": viewRtArray.join(','),
				  "task_duration": taskDuration
				};
				// console.log("Ending trial with data:", trial_data); // Comment this back in for debugging
				jsPsych.finishTrial(trial_data);
			  };
		};
	};

	SelectionLearningPlugin.info = info;

	return SelectionLearningPlugin;
})(jsPsychModule);
