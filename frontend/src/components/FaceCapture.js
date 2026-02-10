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
    };

    const processImage = async () => {
        if (!imgSrc) return;
        setLoading(true);

        try {
            // Convert base64 to blob
            const res = await fetch(imgSrc);
            const blob = await res.blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post(`${API_URL}/detect`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setResult(response.data);
        } catch (error) {
            console.error("Error processing image", error);
            alert("Error processing image: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
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
            <header>
                <button onClick={logout} style={{ float: 'right' }}>Logout ({user.email})</button>
                <h1>Face Verification</h1>
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
                        <button onClick={retake} disabled={loading}>Retake</button>
                        <button onClick={processImage} disabled={loading}>
                            {loading ? 'Processing...' : 'Verify Face'}
                        </button>
                    </>
                )}
            </div>

            {result && (
                <div className="results">
                    <h3>Results:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                    {result.imageUrl && (
                        <div>
                            <p>Saved to: <a href={result.imageUrl} target="_blank" rel="noreferrer">View Image</a></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FaceCapture;
