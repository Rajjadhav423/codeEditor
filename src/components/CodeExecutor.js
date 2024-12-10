// import React, { useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const CodeExecutor = ({ code, language }) => {
//     const [output, setOutput] = useState('');
//     const [loading, setLoading] = useState(false);

//     const executeCode = async () => {
//         setLoading(true);
//         setOutput('');

//         // Prepare the payload based on selected language
//         const payload = {
//             source_code: code,
//             language_id: getLanguageId(language),
//             stdin: '',
//             expected_output: '',
//         };

//         try {
//             const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions', payload, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-Auth-Token': '807f08f107msh2033d0832541f85p1c2586jsn5dd20f48a50b', // Use your actual API key here
//                 },
//             });

//             const { token } = response.data;

//             // Polling for result
//             const resultResponse = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
//                 headers: {
//                     'X-Auth-Token': '807f08f107msh2033d0832541f85p1c2586jsn5dd20f48a50b', // Use your actual API key here
//                 },
//             });

//             setOutput(resultResponse.data.stdout || resultResponse.data.stderr || 'No output');
//         } catch (error) {
//             if (error.response) {
//                 console.error('Error response:', error.response.data);
//                 toast.error(`Error: ${error.response.data.message || 'Unknown error'}`);
//             } else {
//                 toast.error('Error executing code');
//                 console.error(error);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getLanguageId = (language) => {
//         switch (language) {
//             case 'JavaScript':
//                 return 63; // Language ID for JavaScript
//             case 'Python':
//                 return 71; // Language ID for Python
//             case 'Java':
//                 return 62; // Language ID for Java
//             case 'C++':
//                 return 54; // Language ID for C++
//             default:
//                 return null;
//         }
//     };

//     return (
//         <div>
//             <button onClick={executeCode} disabled={loading}>
//                 {loading ? 'Executing...' : 'Run Code'}
//             </button>
//             <pre>{output}</pre>
//         </div>
//     );
// };

// export default CodeExecutor;



import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CodeExecutor = ({ code, language }) => {
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    
    console.log(code)    

    const executeCode = async () => {
        setLoading(true);
        setOutput('');

        // API Configuration
        const JUDGE_URL = 'https://judge029.p.rapidapi.com/submissions';
        const JUDGE_API_KEY = '807f08f107msh2033d0832541f85p1c2586jsn5dd20f48a50b';
        const JUDGE_API_HOST = 'judge0-ce.p.rapidapi.com';

        // Prepare the payload
        const payload = {
            source_code: "console.log(`Rajesh jadhav`) ", // The raw code as a string
            language_id: 63, // Language ID
            stdin: '', // Standard input, modify if needed
            expected_output: '', // Optional, can be left empty
        };
        console.log(payload.source_code)

        try {
            // Submit the code
            const submissionResponse = await axios.post(JUDGE_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': JUDGE_API_KEY,
                    'X-RapidAPI-Host': JUDGE_API_HOST,
                },
            });

            const { token } = submissionResponse.data;

            // Poll for the result using the token
            let resultResponse;
            let retries = 0;

            while (retries < 5) {
                await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
                resultResponse = await axios.get(`${JUDGE_URL}/${token}`, {
                    headers: {
                        'X-RapidAPI-Key': JUDGE_API_KEY,
                        'X-RapidAPI-Host': JUDGE_API_HOST,
                    },
                });

                if (resultResponse.data.status.id === 3) break; // Status 3 means "Completed"
                retries++;
            }

            // Display the result
            setOutput(
                resultResponse.data.stdout ||
                resultResponse.data.stderr ||
                resultResponse.data.compile_output ||
                'No output'
            );
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response.data);
                toast.error(`Error: ${error.response.data.message || 'Unknown error'}`);
            } else {
                toast.error('Error executing code');
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const getLanguageId = (language) => {
        switch (language) {
            case 'JavaScript':
                return 63; // Language ID for JavaScript
            case 'Python':
                return 71; // Language ID for Python
            case 'Java':
                return 62; // Language ID for Java
            case 'C++':
                return 54; // Language ID for C++
            default:
                return null;
        }
    };

    return (
        <div>
            <button onClick={executeCode} disabled={loading}>
                {loading ? 'Executing...' : 'Run Code'}
            </button>
            <pre>{output}</pre>
        </div>
    );
};

export default CodeExecutor;
