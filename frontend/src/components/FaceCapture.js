import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FaceCapture = () => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [user, setUser] = useState(null);
    const [enrollName, setEnrollName] = useState('');
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
            });

            return () => subscription.unsubscribe();
        };
        getSession();
    }, []);

    const login = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
        setResult(null);
        setEnrollName('');
    };

    const processImage = async () => {
        if (!imgSrc) return;
        setLoading(true);
        setResult(null);

        try {
            // Convert base64 to blob
            const res = await fetch(imgSrc);
            const blob = await res.blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('image', file);

            // CHANGED: Use /search instead of /detect
            const response = await axios.post(`${API_URL}/search`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setResult(response.data);
        } catch (error) {
            console.error("Error processing image", error);
            // Handle 404 (No face) separately if needed, though API returns 404 for no face in backend
            if (error.response?.status === 404) {
                alert("No face detected or error: " + (error.response?.data?.error));
            } else {
                alert("Error processing image: " + (error.response?.data?.error || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const enrollFace = async () => {
        if (!enrollName.trim() || !result?.detectedFace?.id) return;
        setEnrolling(true);
        try {
            await axios.post(`${API_URL}/enroll`, {
                detectionId: result.detectedFace.id,
                name: enrollName,
                imageUrl: result.imageUrl
            });
            alert('Person enrolled successfully!');
            // Update UI to show as MATCH
            setResult(prev => ({
                ...prev,
                status: 'MATCH',
                bestMatch: { card: { name: enrollName, id: 'new' }, similarity: 1.0 }
            }));
        } catch (error) {
            console.error("Error enrolling", error);
            alert("Error enrolling: " + (error.response?.data?.error || error.message));
        } finally {
            setEnrolling(false);
        }
    };

    const openDoorManual = async () => {
        try {
            await axios.post(`${API_URL}/door/open`);
            alert('Door opening command sent!');
        } catch (error) {
            console.error("Error opening door", error);
            alert("Failed to open door: " + (error.response?.data?.error || error.message));
        }
    };

    if (!user) {
        return (
            <div className="container">
                <h1>Facial Validation App</h1>
                <button onClick={login}>Login with Google</button>
            </div>
        );
    }

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Face Verification</h1>
                <div>
                    <button onClick={openDoorManual} style={{ marginRight: '10px', backgroundColor: '#4a90e2' }}>Open Door</button>
                    <button onClick={logout}>Logout ({user.email})</button>
                </div>
            </header>

            <div className="webcam-container">
                {imgSrc ? (
                    <img src={imgSrc} alt="captured" />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={640}
                        height={480}
                        videoConstraints={{ facingMode: "user" }}
                    />
                )}
            </div>

            <div className="controls">
                {!imgSrc ? (
                    <button onClick={capture}>Capture Photo</button>
                ) : (
                    <>
                        <button onClick={retake} disabled={loading || enrolling}>Retake</button>
                        {!result && (
                            <button onClick={processImage} disabled={loading}>
                                {loading ? 'Processing...' : 'Identify Face'}
                            </button>
                        )}
                    </>
                )}
            </div>

            {result && (
                <div className="results" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>

                    {/* STATUS DISPLAY */}
                    {result.status === 'MATCH' ? (
                        <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
                            <h2 style={{ margin: 0 }}>✅ ACCESS GRANTED</h2>
                            <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                Welcome, {result.bestMatch?.card?.name || 'Unknown'}
                            </p>
                            <small>Confidence: {(result.bestMatch?.similarity * 100).toFixed(1)}%</small>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '15px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>
                            <h2 style={{ margin: 0 }}>❌ NOT RECOGNIZED</h2>
                            <p>Face detected, but not found in database.</p>

                            {/* ENROLLMENT FORM */}
                            <div style={{ marginTop: '15px', borderTop: '1px solid #f5c6cb', paddingTop: '10px' }}>
                                <h4>Register this person?</h4>
                                <input
                                    type="text"
                                    placeholder="Enter Name"
                                    value={enrollName}
                                    onChange={(e) => setEnrollName(e.target.value)}
                                    style={{ padding: '8px', marginRight: '10px' }}
                                />
                                <button onClick={enrollFace} disabled={enrolling || !enrollName.trim()}>
                                    {enrolling ? 'Saving...' : 'Enroll Face'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                        <p>Saved to: <a href={result.imageUrl} target="_blank" rel="noreferrer">View Image</a> (Log ID: {result.logId})</p>
                        <details>
                            <summary>Debug Info</summary>
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceCapture;
