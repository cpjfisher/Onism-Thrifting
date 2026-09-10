// ==========================================
// ONISM THRIFTING
// DONATION FORM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.querySelector("#sell-form");

    const status =
        document.querySelector("#donation-status");

    const photosInput =
        document.querySelector("#photos");


    if (!form) {
        return;
    }


    // ======================================
    // IMAGE COMPRESSION
    // ======================================

    function compressImage(file) {

        return new Promise((resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = (event) => {

                const image =
                    new Image();


                image.onload = () => {

                    const MAX_DIMENSION = 1400;

                    let width =
                        image.width;

                    let height =
                        image.height;


                    if (
                        width > MAX_DIMENSION ||
                        height > MAX_DIMENSION
                    ) {

                        const scale =
                            Math.min(
                                MAX_DIMENSION / width,
                                MAX_DIMENSION / height
                            );

                        width =
                            Math.round(
                                width * scale
                            );

                        height =
                            Math.round(
                                height * scale
                            );

                    }


                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        width;

                    canvas.height =
                        height;


                    const context =
                        canvas.getContext("2d");


                    context.drawImage(
                        image,
                        0,
                        0,
                        width,
                        height
                    );


                    canvas.toBlob(
                        (blob) => {

                            if (!blob) {

                                reject(
                                    new Error(
                                        "Image compression failed."
                                    )
                                );

                                return;

                            }


                            const compressedReader =
                                new FileReader();


                            compressedReader.onloadend =
                                () => {

                                    const base64 =
                                        compressedReader
                                            .result
                                            .split(",")[1];


                                    const originalName =
                                        file.name.replace(
                                            /\.[^/.]+$/,
                                            ""
                                        );


                                    resolve({

                                        filename:
                                            `${originalName}.jpg`,

                                        content:
                                            base64

                                    });

                                };


                            compressedReader.readAsDataURL(
                                blob
                            );

                        },

                        "image/jpeg",
                        0.72
                    );

                };


                image.onerror = () => {

                    reject(
                        new Error(
                            "One of the selected images could not be processed."
                        )
                    );

                };


                image.src =
                    event.target.result;

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "One of the selected images could not be read."
                    )
                );

            };


            reader.readAsDataURL(
                file
            );

        });

    }


    // ======================================
    // FORM SUBMISSION
    // ======================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonHTML =
                submitButton.innerHTML;


            if (status) {

                status.hidden = true;

                status.textContent =
                    "Thanks — your donation has been submitted.";

            }


            submitButton.disabled =
                true;


            submitButton.innerHTML = `
                <span>Submitting...</span>
                <span>→</span>
            `;


            try {

                // ==================================
                // PROCESS PHOTOS
                // ==================================

                const selectedPhotos =
                    photosInput
                        ? Array.from(
                            photosInput.files
                        )
                        : [];


                if (
                    selectedPhotos.length > 5
                ) {

                    throw new Error(
                        "Please upload a maximum of 5 photos."
                    );

                }


                const processedPhotos =
                    [];


                for (
                    const file
                    of selectedPhotos
                ) {

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        throw new Error(
                            "Please only upload image files."
                        );

                    }


                    const compressed =
                        await compressImage(
                            file
                        );


                    processedPhotos.push(
                        compressed
                    );

                }


                // Keep the request safely below
                // Vercel's request size limit.

                const totalPhotoSize =
                    processedPhotos.reduce(
                        (total, photo) =>
                            total +
                            photo.content.length,
                        0
                    );


                if (
                    totalPhotoSize >
                    3000000
                ) {

                    throw new Error(
                        "The selected photos are too large. Please use fewer photos and try again."
                    );

                }


                // ==================================
                // GET FORM DATA
                // ==================================

                const formData =
                    new FormData(form);


                const data = {

                    submissionType:
                        formData.get(
                            "submission-type"
                        ),

                    name:
                        formData.get(
                            "name"
                        ),

                    email:
                        formData.get(
                            "email"
                        ),

                    phone:
                        formData.get(
                            "phone"
                        ),

                    clothingType:
                        formData.get(
                            "clothing-type"
                        ),

                    quantity:
                        formData.get(
                            "quantity"
                        ),

                    condition:
                        formData.get(
                            "condition"
                        ),

                    message:
                        formData.get(
                            "message"
                        ),

                    photos:
                        processedPhotos

                };


                // ==================================
                // SEND TO VERCEL FUNCTION
                // ==================================

                const response =
                    await fetch(
                        "/api/donation",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    data
                                )

                        }
                    );


                const result =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Something went wrong."
                    );

                }


                // ==================================
                // SUCCESS
                // ==================================

                form.reset();


                if (status) {

                    status.textContent =
                        "Thanks — your donation has been submitted. We'll review your pieces and get back to you.";

                    status.hidden =
                        false;

                }


            } catch (error) {

                console.error(
                    "Donation form error:",
                    error
                );


                if (status) {

                    status.textContent =
                        error.message ||
                        "Sorry, your donation could not be submitted. Please try again.";

                    status.hidden =
                        false;

                }


            } finally {

                submitButton.disabled =
                    false;


                submitButton.innerHTML =
                    originalButtonHTML;

            }

        }
    );

});