import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;




























// import React, { useState, useRef, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import ACTIONS from '../Actions';
// import Client from '../components/Client';
// import Editor from '../components/Editor';
// import CodeExecutor from '../components/CodeExecutor'; // Import CodeExecutor
// import { initSocket } from '../socket';
// import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

// const EditorPage = () => {
//     const socketRef = useRef(null);
//     const codeRef = useRef('');
//     const location = useLocation();
//     const { roomId } = useParams();
//     const reactNavigator = useNavigate();
//     const [clients, setClients] = useState([]);
//     const [language, setLanguage] = useState('JavaScript'); // Default language

//     useEffect(() => {
//         const init = async () => {
//             socketRef.current = await initSocket();
//             socketRef.current.on('connect_error', (err) => handleErrors(err));
//             socketRef.current.on('connect_failed', (err) => handleErrors(err));

//             function handleErrors(e) {
//                 console.log('socket error', e);
//                 toast.error('Socket connection failed, try again later.');
//                 reactNavigator('/');
//             }

//             socketRef.current.emit(ACTIONS.JOIN, {
//                 roomId,
//                 username: location.state?.username,
//             });

//             // Listening for joined event
//             socketRef.current.on(
//                 ACTIONS.JOINED,
//                 ({ clients, username }) => {
//                     if (username !== location.state?.username) {
//                         toast.success(`${username} joined the room.`);
//                         console.log(`${username} joined`);
//                     }
//                     setClients(clients);
//                     socketRef.current.emit(ACTIONS.SYNC_CODE, {
//                         code: codeRef.current,
//                         socketId: socketRef.current.id,
//                     });
//                 }
//             );

//             // Listening for disconnected
//             socketRef.current.on(
//                 ACTIONS.DISCONNECTED,
//                 ({ socketId, username }) => {
//                     toast.success(`${username} left the room.`);
//                     setClients((prev) => prev.filter(client => client.socketId !== socketId));
//                 }
//             );
//         };
        
//         init();
        
//         return () => {
//             socketRef.current.disconnect();
//             socketRef.current.off(ACTIONS.JOINED);
//             socketRef.current.off(ACTIONS.DISCONNECTED);
//         };
//     }, []);

//     async function copyRoomId() {
//         try {
//             await navigator.clipboard.writeText(roomId);
//             toast.success('Room ID has been copied to your clipboard');
//         } catch (err) {
//             toast.error('Could not copy the Room ID');
//             console.error(err);
//         }
//     }

//     function leaveRoom() {
//         reactNavigator('/');
//     }

//     if (!location.state) {
//         return <Navigate to="/" />;
//     }

//     return (
//         <div className="mainWrap">
//             <div className="aside">
//                 <div className="asideInner">
//                     <div className="logo">
//                         <img className="logoImage" src="/code-sync.png" alt="logo" />
//                     </div>
//                     <h3>Connected</h3>
//                     <div className="clientsList">
//                         {clients.map((client) => (
//                             <Client key={client.socketId} username={client.username} />
//                         ))}
//                     </div>
//                 </div>
                
//                 {/* Language Selection */}
//                 <select onChange={(e) => setLanguage(e.target.value)} value={language}>
//                     <option value="JavaScript">JavaScript</option>
//                     <option value="Python">Python</option>
//                     <option value="Java">Java</option>
//                     <option value="C++">C++</option>
//                 </select>

//                 {/* Buttons */}
//                 <button className="btn copyBtn" onClick={copyRoomId}>
//                     Copy ROOM ID
//                 </button>
                
//                 <button className="btn leaveBtn" onClick={leaveRoom}>
//                     Leave
//                 </button>
                
//             </div>

//             {/* Editor and Code Executor */}
//             <div className="editorWrap">
//                 <Editor
//                     socketRef={socketRef}
//                     roomId={roomId}
//                     onCodeChange={(code) => { codeRef.current = code; }}
//                 />

//                 {/* Code Execution Component */}
//                 <CodeExecutor code={codeRef.current} language={language} />
                
//             </div>
//         </div>
//     );
// };

// export default EditorPage;








// // import React, { useState, useRef, useEffect } from 'react';
// // import toast from 'react-hot-toast';
// // import ACTIONS from '../Actions';
// // import Client from '../components/Client';
// // import Editor from '../components/Editor';
// // import CodeExecutor from '../components/CodeExecutor'; // Import CodeExecutor
// // import { initSocket } from '../socket';
// // import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';

// // const EditorPage = () => {
// //     const socketRef = useRef(null);
// //     const [code, setCode] = useState(''); // Use state for code
// //     const [clients, setClients] = useState([]);
// //     const [language, setLanguage] = useState('JavaScript'); // Default language
// //     const location = useLocation();
// //     const { roomId } = useParams();
// //     const reactNavigator = useNavigate();

// //     useEffect(() => {
// //         const init = async () => {
// //             socketRef.current = await initSocket();
// //             socketRef.current.on('connect_error', (err) => handleErrors(err));
// //             socketRef.current.on('connect_failed', (err) => handleErrors(err));

// //             function handleErrors(e) {
// //                 console.log('socket error', e);
// //                 toast.error('Socket connection failed, try again later.');
// //                 reactNavigator('/');
// //             }

// //             socketRef.current.emit(ACTIONS.JOIN, {
// //                 roomId,
// //                 username: location.state?.username,
// //             });

// //             // Listening for joined event
// //             socketRef.current.on(
// //                 ACTIONS.JOINED,
// //                 ({ clients, username }) => {
// //                     if (username !== location.state?.username) {
// //                         toast.success(`${username} joined the room.`);
// //                     }
// //                     setClients(clients);
// //                     socketRef.current.emit(ACTIONS.SYNC_CODE, {
// //                         code,
// //                         socketId: socketRef.current.id,
// //                     });
// //                 }
// //             );

// //             // Listening for disconnected
// //             socketRef.current.on(
// //                 ACTIONS.DISCONNECTED,
// //                 ({ socketId, username }) => {
// //                     toast.success(`${username} left the room.`);
// //                     setClients((prev) => prev.filter(client => client.socketId !== socketId));
// //                 }
// //             );
// //         };
        
// //         init();
        
// //         return () => {
// //             socketRef.current.disconnect();
// //             socketRef.current.off(ACTIONS.JOINED);
// //             socketRef.current.off(ACTIONS.DISCONNECTED);
// //         };
// //     }, [code]); // Add `code` to dependency array to sync with socket

// //     async function copyRoomId() {
// //         try {
// //             await navigator.clipboard.writeText(roomId);
// //             toast.success('Room ID has been copied to your clipboard');
// //         } catch (err) {
// //             toast.error('Could not copy the Room ID');
// //             console.error(err);
// //         }
// //     }

// //     function leaveRoom() {
// //         reactNavigator('/');
// //     }

// //     if (!location.state) {
// //         return <Navigate to="/" />;
// //     }

// //     return (
// //         <div className="mainWrap">
// //             <div className="aside">
// //                 <div className="asideInner">
// //                     <div className="logo">
// //                         <img className="logoImage" src="/code-sync.png" alt="logo" />
// //                     </div>
// //                     <h3>Connected</h3>
// //                     <div className="clientsList">
// //                         {clients.map((client) => (
// //                             <Client key={client.socketId} username={client.username} />
// //                         ))}
// //                     </div>
// //                 </div>
                
// //                 {/* Language Selection */}
// //                 <select onChange={(e) => setLanguage(e.target.value)} value={language}>
// //                     <option value="JavaScript">JavaScript</option>
// //                     <option value="Python">Python</option>
// //                     <option value="Java">Java</option>
// //                     <option value="C++">C++</option>
// //                 </select>

// //                 {/* Buttons */}
// //                 <button className="btn copyBtn" onClick={copyRoomId}>
// //                     Copy ROOM ID
// //                 </button>
                
// //                 <button className="btn leaveBtn" onClick={leaveRoom}>
// //                     Leave
// //                 </button>
                
// //             </div>

// //             {/* Editor and Code Executor */}
// //             <div className="editorWrap">
// //                 <Editor
// //                     socketRef={socketRef}
// //                     roomId={roomId}
// //                     onCodeChange={(newCode) => { setCode(newCode); }} // Update code state
// //                 />
                    
// //                 {/* Code Execution Component */}
// //                 <CodeExecutor code={code} language={language} />
                
// //             </div>
// //         </div>
// //     );
// // };

// // export default EditorPage;
