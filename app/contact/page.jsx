'use client';

import "./contact.css";
import { useState } from "react";


export default function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        const { name, email, message } = formData;
        const postData = { name, email, message };

        try {
            const API_URL = "https://api.bitcoinbutik.com/api/contact";

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Something went wrong");
            }

            alert("Message sent successfully!");

            setFormData({
                name: "",
                email: "",
                message: "",
            });
        } catch (error) {
            alert(`Failed to send message: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ContactPage">
            <div className="ContactFormSection">
                <div className="banner-content">
                    <h1 className="Contact-title-text">Contact Us</h1>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-12 col-sm-12 col-12 get-in-touch-box">
                            <div className="get-in-touch-content">
                                <h3>Get in touch</h3>
                                <p className="email-link">
                                    <a href="">Email us</a>
                                </p>
                                <p className="email-link">
                                    <a href="mailto:info@bitcoinbutik.com">
                                        info@bitcoinbutik.com
                                    </a>
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-7 col-md-12 col-sm-12 col-12 leave-message-box">
                            <div className="leave-message-content">
                                <h3>Leave us a message</h3>
                                <form onSubmit={handleSubmit} className="message-form">
                                    <div className="leave-Form">
                                        <label htmlFor="name">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                    <div className="leave-Form">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </div>
                                    <div className="leave-Form">
                                        <label htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            placeholder="Message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Send"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}