import mongoose from 'mongoose';
import Course from './models/Course.js';
import Lesson from './models/Lesson.js';
import Quiz from './models/Quiz.js';

const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

const rawData = `
### MODULE 1: THE COLLAPSE OF CLASSICAL PHYSICS

#### Lesson 1.1: The Blackbody Radiation Problem
1. Q: What does the Rayleigh-Jeans Law incorrectly predict at high frequencies?
   A) Energy decreases to zero | B) Energy remains constant | C) Energy becomes infinite | D) Light turns red
   Correct: C
2. Q: What is a "Blackbody"?
   A) An object that reflects all light | B) An object that absorbs all incident radiation | C) A body that only emits UV light | D) A planet with no atmosphere
   Correct: B
3. Q: Planck’s constant (h) has the units of:
   A) Force | B) Energy × Time | C) Velocity | D) Power
   Correct: B
4. Q: Which phenomenon showed that classical physics was incomplete?
   A) Gravity | B) Sound waves | C) The Ultraviolet Catastrophe | D) Magnetism
   Correct: C
5. Q: In the equation E=nhν, what does 'n' represent?
   A) Speed of light | B) A positive integer | C) Density | D) Refractive index
   Correct: B

#### Lesson 1.2: The Photoelectric Effect
6. Q: Who explained the Photoelectric Effect using the concept of photons?
   A) Newton | B) Maxwell | C) Einstein | D) Bohr
   Correct: C
7. Q: What is the "Work Function"?
   A) Energy required to move an atom | B) Minimum energy to eject an electron | C) Total heat produced | D) Kinetic energy of light
   Correct: B
8. Q: If you increase the intensity of light (keeping frequency the same), what happens?
   A) Electrons move faster | B) More electrons are ejected | C) No electrons are ejected | D) Frequency increases
   Correct: B
9. Q: The kinetic energy of ejected electrons depends on:
   A) Light intensity | B) Light frequency | C) Metal thickness | D) Exposure time
   Correct: B
10. Q: Light behaves as what in the Photoelectric Effect?
    A) A continuous wave | B) A particle (photon) | C) A stationary field | D) An acoustic vibration
    Correct: B

#### Lesson 1.3: Atomic Models: Bohr to Now
11. Q: What was the main flaw in the Rutherford model?
    A) No nucleus | B) Electrons should spiral into the nucleus | C) It had no protons | D) It was too large
    Correct: B
12. Q: According to Bohr, electrons exist in:
    A) Random clouds | B) Quantized stationary orbits | C) The nucleus | D) Outside the atom
    Correct: B
13. Q: When an electron moves from a high energy level to a lower one, it:
    A) Absorbs a photon | B) Emits a photon | C) Disappears | D) Gains mass
    Correct: B
14. Q: The Bohr model works most accurately for which atom?
    A) Iron | B) Gold | C) Hydrogen | D) Uranium
    Correct: C
15. Q: What is the "Ground State"?
    A) The highest energy level | B) The lowest energy level | C) A state of zero gravity | D) When an atom is ionized
    Correct: B

### MODULE 2: THE WAVE-PARTICLE DUALITY

#### Lesson 2.1: The Double Slit Experiment
16. Q: What pattern is formed on the screen when light passes through two slits?
    A) Two bright lines | B) An interference pattern | C) A single dot | D) A shadow
    Correct: B
17. Q: If you observe which slit an electron goes through, what happens?
    A) The pattern gets brighter | B) The interference pattern disappears | C) The electron stops | D) Nothing changes
    Correct: B
18. Q: The Double Slit Experiment proves that matter has:
    A) Mass | B) Wave-like properties | C) Only particle properties | D) Color
    Correct: B
19. Q: Which term describes the overlapping of waves?
    A) Diffraction | B) Superposition | C) Refraction | D) Reflection
    Correct: B
20. Q: Can the double-slit experiment be performed with molecules?
    A) No, only light | B) No, only electrons | C) Yes, even large molecules | D) Only in a vacuum
    Correct: C

#### Lesson 2.2: De Broglie’s Hypothesis
21. Q: What is the formula for De Broglie wavelength?
    A) λ = mc² | B) λ = h/p | C) λ = F/m | D) λ = hv
    Correct: B
22. Q: As the momentum of a particle increases, its wavelength:
    A) Increases | B) Decreases | C) Stays the same | D) Becomes infinite
    Correct: B
23. Q: Why don't we see the wave nature of a moving car?
    A) It's too fast | B) Its mass is too large (wavelength is too small) | C) It has no frequency | D) Gravity stops it
    Correct: B
24. Q: De Broglie suggested that:
    A) Only light is a wave | B) Only matter is a wave | C) All matter has wave properties | D) Waves do not exist
    Correct: C
25. Q: The 'p' in the De Broglie equation stands for:
    A) Position | B) Pressure | C) Momentum | D) Power
    Correct: C

#### Lesson 2.3: Heisenberg’s Uncertainty Principle
26. Q: You cannot simultaneously measure which two properties with infinite precision?
    A) Mass and Volume | B) Position and Momentum | C) Color and Shape | D) Charge and Spin
    Correct: B
27. Q: If we know the exact position of an electron, what happens to the uncertainty of its momentum?
    A) It becomes zero | B) It becomes infinite | C) It stays constant | D) it decreases
    Correct: B
28. Q: The Uncertainty Principle is a result of:
    A) Bad equipment | B) The wave nature of particles | C) Human error | D) Gravity
    Correct: B
29. Q: Does this principle apply to large objects like a baseball?
    A) No | B) Yes, but the effect is too small to notice | C) Only if the ball is spinning | D) Only in space
    Correct: B
30. Q: The Uncertainty Principle is mathematically expressed as:
    A) Δx Δp ≥ h/4π | B) E=mc² | C) F=ma | D) PV=nRT
    Correct: A

### MODULE 3: THE SCHRÖDINGER EQUATION

#### Lesson 3.1: Introduction to the Wavefunction (ψ)
31. Q: What does the square of the wavefunction (|ψ|²) represent?
    A) Energy | B) Particle Velocity | C) Probability Density | D) Mass
    Correct: C
32. Q: The Schrödinger equation is a:
    A) Linear algebraic equation | B) Differential equation | C) Chemical formula | D) Simple addition
    Correct: B
33. Q: What is the "Copenhagen Interpretation"?
    A) Particles are always particles | B) Probability defines reality until measured | C) Physics is fake | D) Atoms are solid balls
    Correct: B
34. Q: If a wavefunction is "Normalized", the total probability of finding the particle is:
    A) 0 | B) 0.5 | C) 1 | D) Infinite
    Correct: C
35. Q: ψ (Psi) itself is often a:
    A) Real number | B) Complex number | C) Negative mass | D) Vector of force
    Correct: B

#### Lesson 3.2: Solving the 1D Infinite Square Well
36. Q: In an infinite square well, the potential outside the well is:
    A) Zero | B) Finite | C) Infinite | D) Negative
    Correct: C
37. Q: The energy levels of a particle in a box are:
    A) Continuous | B) Quantized (Discrete) | C) Random | D) Always zero
    Correct: B
38. Q: What is the lowest possible energy (n=1) called?
    A) Ground state energy | B) Null energy | C) Kinetic peak | D) Final energy
    Correct: A
39. Q: Where is a particle in its ground state most likely to be found in the box?
    A) Near the walls | B) In the center | C) Outside the box | D) Nowhere
    Correct: B
40. Q: As the box gets narrower, the energy levels:
    A) Decrease | B) Increase | C) Stay the same | D) Disappear
    Correct: B

#### Lesson 3.3: Quantum Tunneling Explained
41. Q: Quantum tunneling allows particles to:
    A) Fly faster than light | B) Pass through energy barriers | C) Teleport to other planets | D) Turn into light
    Correct: B
42. Q: Tunneling occurs because the wavefunction:
    A) Ends abruptly at a wall | B) Decays exponentially through a barrier | C) Does not exist in barriers | D) Reflects 100%
    Correct: B
43. Q: Which technology relies on quantum tunneling?
    A) Steam engines | B) Flash memory (USB drives) | C) Light bulbs | D) Bicycles
    Correct: B
44. Q: As a barrier gets thicker, the chance of tunneling:
    A) Increases | B) Decreases | C) Stays the same | D) Becomes 100%
    Correct: B
45. Q: Tunneling is essential for which process in stars?
    A) Gravity | B) Nuclear Fusion | C) Cooling | D) Orbiting
    Correct: B

### MODULE 4: THE QUANTUM HARMONIC OSCILLATOR

#### Lesson 4.1: The Physics of Vibrations
46. Q: In a quantum harmonic oscillator, the potential energy V(x) is proportional to:
    A) x | B) x² | C) 1/x | D) √x
    Correct: B
47. Q: How do energy levels in a harmonic oscillator differ from a particle in a box?
    A) They are continuous | B) They are equally spaced | C) They get closer together | D) They are random
    Correct: B
48. Q: Which physical system is often modeled as a quantum harmonic oscillator?
    A) Diatomic molecule vibrations | B) Planetary orbits | C) Free falling rocks | D) Falling rain
    Correct: A
49. Q: The frequency of the oscillator depends on the mass (m) and what else?
    A) Temperature | B) Force constant (k) | C) Color | D) Volume
    Correct: B
50. Q: Classical oscillators can have zero energy. Can quantum ones?
    A) Yes | B) No, they have zero-point energy | C) Only at absolute zero | D) Only in a vacuum
    Correct: B

#### Lesson 4.2: Energy Quantization & Zero-Point Energy
51. Q: What is the formula for the energy levels of a quantum harmonic oscillator?
    A) En = (n + 1/2)hν | B) E = mc² | C) E = hf | D) E = 1/2 mv²
    Correct: A
52. Q: What is the energy of the ground state (n=0)?
    A) Zero | B) 1/2 hν | C) hν | D) Infinite
    Correct: B
53. Q: Zero-point energy implies that:
    A) Motion ceases at 0K | B) Motion never truly ceases | C) Atoms disappear | D) Gravity becomes zero
    Correct: B
54. Q: The spacing between any two adjacent energy levels is:
    A) hν | B) 1/2 hν | C) n² | D) Decreasing
    Correct: A
55. Q: If the spring constant k increases, the zero-point energy:
    A) Increases | B) Decreases | C) Stays the same | D) Becomes zero
    Correct: A

#### Lesson 4.3: Ladder Operators
56. Q: What does the "Raising Operator" (a†) do?
    A) Lowers the energy state | B) Increases the energy state by one level | C) Deletes a particle | D) Flips the spin
    Correct: B
57. Q: What happens if you apply the "Lowering Operator" (a) to the ground state?
    A) It goes to a negative state | B) It results in zero | C) It increases energy | D) The particle explodes
    Correct: B
58. Q: Ladder operators are also known as:
    A) Addition symbols | B) Creation and Annihilation operators | C) Gravity vectors | D) Scalar fields
    Correct: B
59. Q: The commutator [a, a†] equals:
    A) 0 | B) 1 | C) -1 | D) i
    Correct: B
60. Q: Using ladder operators avoids solving which type of equations?
    A) Simple addition | B) Differential equations | C) Logic gates | D) Geometry
    Correct: B

### MODULE 5: SPIN AND ANGULAR MOMENTUM

#### Lesson 5.1: The Stern-Gerlach Experiment
61. Q: What did the Stern-Gerlach experiment use to split the particle beam?
    A) Uniform electric field | B) Inhomogeneous magnetic field | C) Glass prism | D) Water tank
    Correct: B
62. Q: How many spots appeared on the detector when silver atoms were used?
    A) A continuous line | B) Two distinct spots | C) One center spot | D) Four spots
    Correct: B
63. Q: This experiment proved that spin is:
    A) Continuous | B) Quantized | C) Non-existent | D) Only found in light
    Correct: B
64. Q: What property was being measured in the Stern-Gerlach experiment?
    A) Mass | B) Magnetic dipole moment (spin) | C) Charge | D) Velocity
    Correct: B
65. Q: Silver atoms were used because they have:
    A) No electrons | B) One unpaired outer electron | C) Radioactive nuclei | D) Blue color
    Correct: B

#### Lesson 5.2: Identical Particles & Fermions vs. Bosons
66. Q: Which particles follow the Pauli Exclusion Principle?
    A) Bosons | B) Fermions | C) Photons | D) Gluons
    Correct: B
67. Q: Electrons are an example of:
    A) Bosons | B) Fermions | C) Mesons | D) Gravitons
    Correct: B
68. Q: Particles with integer spin (0, 1, 2...) are called:
    A) Fermions | B) Bosons | C) Quarks | D) Neutrinos
    Correct: B
69. Q: What happens when two bosons occupy the same state at low temperatures?
    A) They explode | B) Bose-Einstein Condensate | C) They become fermions | D) Nothing
    Correct: B
70. Q: Fermions have which type of spin?
    A) Integer | B) Half-integer (e.g., 1/2) | C) Zero | D) Negative
    Correct: B

#### Lesson 5.3: Introduction to Quantum Magnetism
71. Q: Magnetic properties of materials primarily come from:
    A) Particle mass | B) Electron spin and orbital motion | C) Nuclear weight | D) Heat
    Correct: B
72. Q: In a "Ferromagnetic" material, spins are:
    A) Randomly aligned | B) Aligned in the same direction | C) Aligned in opposite directions | D) Non-existent
    Correct: B
73. Q: What is a "Bohr Magneton"?
    A) A type of atom | B) A physical constant for magnetic moment | C) A magnetic weapon | D) A planet
    Correct: B
74. Q: Paramagnetism occurs when:
    A) There are unpaired electrons | B) All electrons are paired | C) The object is a liquid | D) There is no gravity
    Correct: A
75. Q: Which medical technology uses the magnetic properties of nuclear spin?
    A) X-Ray | B) MRI | C) Ultrasound | D) Stethoscope
    Correct: B

### MODULE 6: ENTANGLEMENT AND INFORMATION

#### Lesson 6.1: The EPR Paradox
76. Q: What does EPR stand for?
    A) Electron Proton Radiation | B) Einstein-Podolsky-Rosen | C) Energy Particle Ratio | D) Electronic Pulse Reading
    Correct: B
77. Q: Einstein used the EPR paradox to argue that Quantum Mechanics was:
    A) Perfect | B) Incomplete | C) Fake | D) Only for light
    Correct: B
78. Q: What is "Local Realism"?
    A) Objects only exist when looking at them | B) Objects have properties independent of measurement | C) Everything is local | D) Realism is a lie
    Correct: B
79. Q: Einstein famously referred to entanglement as:
    A) Beautiful math | B) Spooky action at a distance | C) A tragic mistake | D) The key to the universe
    Correct: B
80. Q: The EPR paper was written to challenge which principle?
    A) Gravity | B) Quantum non-locality | C) Thermodynamics | D) Optics
    Correct: B

#### Lesson 6.2: Quantum Entanglement & Bell’s Inequality
81. Q: If two particles are entangled, measuring one:
    A) Has no effect on the other | B) Instantaneously determines the state of the other | C) Destroys the universe | D) Changes its mass
    Correct: B
82. Q: Who proposed a mathematical way to test Einstein's "Local Realism" vs Quantum Mechanics?
    A) Bohr | B) John Bell | C) Stephen Hawking | D) Richard Feynman
    Correct: B
83. Q: Experimental violations of Bell’s Inequality prove that:
    A) Einstein was right | B) The world is non-local/Quantum Mechanics is correct | C) Math is wrong | D) Speed of light can be exceeded
    Correct: B
84. Q: Does entanglement allow for faster-than-light communication of information?
    A) Yes | B) No | C) Only in a vacuum | D) Only for 5 seconds
    Correct: B
85. Q: Entanglement is a property of:
    A) Single particles | B) Systems of two or more particles | C) Only photons | D) Only electrons
    Correct: B

#### Lesson 6.3: Intro to Quantum Computing & Cryptography
86. Q: What is a "Qubit"?
    A) A 3D pixel | B) A quantum bit that can be 0, 1, or both simultaneously | C) A fast computer fan | D) A unit of mass
    Correct: B
87. Q: Which quantum principle allows a quantum computer to process many paths at once?
    A) Gravity | B) Superposition | C) Friction | D) Heat
    Correct: B
88. Q: What is "Quantum Key Distribution" (QKD)?
    A) A way to unlock doors | B) A secure communication method using quantum states | C) A new type of keyboard | D) A bank vault
    Correct: B
89. Q: If an eavesdropper tries to observe a quantum key, what happens?
    A) They get the key | B) The quantum state is disturbed and the intrusion is detected | C) Nothing | D) The computer shuts down
    Correct: B
90. Q: Which algorithm could theoretically break modern RSA encryption using a quantum computer?
    A) Google Search | B) Shor’s Algorithm | C) Binary Search | D) Bubble Sort
    Correct: B
`;

const parseQuestionsByModule = (text) => {
    const modulesData = [];
    
    // Split text by "### MODULE "
    const moduleSplits = text.split(/### MODULE \d+:/);
    // Important: the first split is usually empty string before "### MODULE 1"
    
    for (const split of moduleSplits) {
        if (!split.trim()) continue;
        
        // The first line is the module name
        const lines = split.trim().split('\n');
        // Because of the split, it starts like " THE COLLAPSE OF CLASSICAL PHYSICS"
        // Let's extract the title properly depending on casing
        const moduleNameMatch = split.match(/^\s*(.+)/);
        if (!moduleNameMatch) continue;
        
        // The course has modules titled like "The Collapse of Classical Physics" (Title Case)
        let rawTitle = moduleNameMatch[1].trim(); // "THE COLLAPSE OF CLASSICAL PHYSICS"
        
        // Convert to Title Case to match existing DB
        const toTitleCase = (str) => {
            return str.toLowerCase().split(' ').map(word => {
                // exception for hyphens or specific words if needed
                if(word.includes('-')) {
                    return word.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
                }
                if(word === 'of' || word === 'and' || word === 'the' || word === 'a') return word; // basic title case
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ').replace(/^the/i, 'The'); // Ensure first "The" is capitalized
        };
        
        let properTitle = toTitleCase(rawTitle);
        if(properTitle === "The Schrodinger Equation" || properTitle === "The Schrödinger Equation") properTitle = "The Schrödinger Equation";
        
        // Parse questions within this module
        const questions = [];
        const blocks = split.split(/(?=\d+\.\s*Q:)/).filter(b => b.trim().match(/^\d+\.\s*Q:/));
        
         for (const block of blocks) {
            const questionMatch = block.match(/\d+\.\s*Q:\s*(.+)/);
            if (!questionMatch) continue;
            
            const questionText = questionMatch[1].trim();
            
            const optionsMatch = block.match(/A\)\s*(.+?)\s*\|\s*B\)\s*(.+?)\s*\|\s*C\)\s*(.+?)\s*\|\s*D\)\s*([\s\S]+?)(?:\n\s*Correct:|$)/);
            if (!optionsMatch) continue;
            
            const options = [
                optionsMatch[1].trim(),
                optionsMatch[2].trim(),
                optionsMatch[3].trim(),
                optionsMatch[4].trim(),
            ]; // UI expects just string values maybe, but the frontend adds "A)" to UI? Actually it just maps over options directly. Wait, the frontend renders them as normal.
            
            const correctMatch = block.match(/Correct:\s*([A-D])/);
            if (!correctMatch) continue;
            
            const correctLetter = correctMatch[1];
            const correctIndex = correctLetter.charCodeAt(0) - 65; // A=0, B=1, ...
            
            questions.push({
                type: 'multiple_choice',
                question: questionText,
                options: options,
                correctAnswer: correctIndex,
                difficulty: "medium",
                skillMapped: properTitle, // use title case module name
                explanation: ""
            });
        }
        
        modulesData.push({
            moduleName: properTitle,
            questions: questions
        });
    }
    
    return modulesData;
};

const run = async () => {
    try {
        await mongoose.connect(URI);
        console.log('Connected to DB');
        
        const course = await Course.findOne({ title: /Advanced Particle/i });
        if (!course) {
            throw new Error("Course not found!");
        }
        
        const lessons = await Lesson.find({ courseId: course._id });
        
        const modulesData = parseQuestionsByModule(rawData);
        
        let insertedCount = 0;
        
        for (const mod of modulesData) {
            // Find a lesson that belongs to this module
            // e.g. mod.moduleName = "The Collapse of Classical Physics"
            // The lessons in DB might have module = "The Collapse of Classical Physics"
            const lesson = lessons.find(l => l.module.toLowerCase() === mod.moduleName.toLowerCase());
            
            if (!lesson) {
                console.log("Could not find lesson for module:", mod.moduleName);
                // Look closely at the list of modules:
                console.log("Available:", [...new Set(lessons.map(l=>l.module))]);
                continue;
            }
            
            // Check if there is an existing Quiz for this lesson/module
            let quiz = await Quiz.findOne({ lessonId: lesson._id });
            
            if (quiz) {
                quiz.questions.push(...mod.questions);
                await quiz.save();
                insertedCount += mod.questions.length;
                console.log(`Added ${mod.questions.length} questions to existing quiz for ${mod.moduleName}`);
            } else {
                const newQuiz = new Quiz({
                    lessonId: lesson._id,
                    courseId: course._id,
                    title: `${mod.moduleName} Quiz`,
                    questions: mod.questions,
                });
                await newQuiz.save();
                insertedCount += mod.questions.length;
                console.log(`Created new quiz for ${mod.moduleName} with ${mod.questions.length} questions`);
            }
        }
        
        console.log(`Successfully processed ${insertedCount} questions in total.`);
        
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
