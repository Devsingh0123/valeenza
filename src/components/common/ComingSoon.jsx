import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import logo from "../../assets/logo.png"; // ← apne logo ka path daalo

const ComingSoon = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full ">
            {/* Back Button */}

            {/* <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-amber-600 hover:underline  cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button> */}

            {/* Main Content */}
            <div className="w-full py-16 flex flex-col justify-center items-center">
                {/* Coming Soon Badge */}
                <div className="text-center mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                        <Clock className="w-4 h-4" />
                        Coming Soon
                    </span>
                </div>

             

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
                    We're{" "}
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Almost There!
                    </span>
                </h1>

                {/* Description */}
                <p className="text-center text-gray-500 text-base mx-auto mb-8">
                    Something amazing is on its way. Stay tuned for updates!
                </p>

                {/* Decorative Line */}
                <div className="flex justify-center items-center gap-2 mb-8">
                    <div className="w-12 h-px bg-amber-300"></div>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div className="w-12 h-px bg-amber-300"></div>
                </div>

                {/* Under Development Message */}
                <div className="max-w-md mx-auto text-center">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-amber-100">
                        <p className="text-gray-600 text-sm">
                            This feature is currently under development.
                            <span className="block text-gray-500 text-xs mt-1">
                                We appreciate your patience!
                            </span>
                        </p>
                    </div>
                </div>

                {/* Explore Link */}
                <p className="text-center text-gray-400 text-sm mt-8">
                    Meanwhile, explore our{" "}
                    <button
                        onClick={() => navigate("/")}
                        className="text-amber-600 hover:underline font-medium cursor-pointer"
                    >
                        existing collection
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ComingSoon;