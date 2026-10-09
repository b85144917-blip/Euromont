(function () {
    if (new URLSearchParams(window.location.search).get("gallery") === "default") {
        return;
    }

    const gallery = document.querySelector("#image-gallery");
    const links = gallery ? Array.from(gallery.querySelectorAll(".image .img-wrapper > a")) : [];
    const productImage = document.querySelector("#product-detail[data-gallery-preview-trigger]");
    const productThumbnails = productImage
        ? Array.from(document.querySelectorAll(".product-links-wap img"))
        : [];
    const productPreviousButton = document.querySelector("[data-product-image-previous]");
    const productNextButton = document.querySelector("[data-product-image-next]");

    if (links.length === 0 && productThumbnails.length === 0) {
        return;
    }

    links.forEach(function (link, index) {
        const thumbnail = link.querySelector("img");
        const label = "Fotografija " + (index + 1);

        if (thumbnail && !thumbnail.alt) {
            thumbnail.alt = label;
        }

        link.setAttribute("aria-label", "Otvori " + label.toLowerCase());
    });

    document.documentElement.classList.add("gallery-modern");

    const modal = document.createElement("div");
    modal.className = "gallery-preview";
    modal.id = "gallery-preview";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Pregled galerije");
    modal.tabIndex = -1;
    modal.innerHTML = [
        '<div class="gallery-preview__stage">',
        '<button class="gallery-preview__button gallery-preview__button--previous" type="button" aria-label="Prethodna fotografija">&#8249;</button>',
        '<img class="gallery-preview__image" alt="">',
        '<button class="gallery-preview__button gallery-preview__button--next" type="button" aria-label="Sledeća fotografija">&#8250;</button>',
        '<button class="gallery-preview__button gallery-preview__button--close" type="button" aria-label="Zatvori pregled">&times;</button>',
        '</div>',
        '<div class="gallery-preview__footer">',
        '<span class="gallery-preview__count" aria-live="polite"></span>',
        '<span class="gallery-preview__hint">Za zatvaranje pritisnite Esc</span>',
        '</div>'
    ].join("");
    document.body.appendChild(modal);

    const image = modal.querySelector(".gallery-preview__image");
    const count = modal.querySelector(".gallery-preview__count");
    const previousButton = modal.querySelector(".gallery-preview__button--previous");
    const nextButton = modal.querySelector(".gallery-preview__button--next");
    const closeButton = modal.querySelector(".gallery-preview__button--close");
    let currentIndex = 0;
    let currentImages = [];
    let previousFocus = null;
    let previousOverflow = "";
    let touchStartX = null;
    let touchStartY = null;
    let productTouchStartX = null;
    let productTouchStartY = null;
    let suppressProductImageClickUntil = 0;

    function restoreGallery() {
        modal.hidden = true;
        document.body.style.overflow = previousOverflow;
        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    function showImage(index) {
        currentIndex = (index + currentImages.length) % currentImages.length;
        const selectedImage = currentImages[currentIndex];

        image.classList.add("is-loading");
        image.alt = selectedImage.alt;
        count.textContent = "Fotografija " + (currentIndex + 1) + " od " + currentImages.length;
        image.src = selectedImage.src;
    }

    function showProductImage(direction) {
        if (!productImage || productThumbnails.length === 0) {
            return;
        }

        const currentSource = productImage.currentSrc || productImage.src;
        const currentIndex = productThumbnails.findIndex(function (thumbnail) {
            return (thumbnail.currentSrc || thumbnail.src) === currentSource;
        });
        const nextIndex = (currentIndex + direction + productThumbnails.length) % productThumbnails.length;
        const nextThumbnail = productThumbnails[nextIndex];

        productImage.src = nextThumbnail.currentSrc || nextThumbnail.src;
        productImage.alt = nextThumbnail.alt || "Fotografija proizvoda " + (nextIndex + 1);
    }

    function openGallery(index, trigger) {
        currentImages = links.map(function (link, imageIndex) {
            const thumbnail = link.querySelector("img");
            return {
                src: link.href,
                alt: thumbnail && thumbnail.alt ? thumbnail.alt : "Fotografija " + (imageIndex + 1)
            };
        });
        previousFocus = trigger;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modal.hidden = false;
        showImage(index);
        closeButton.focus();
        window.history.pushState(
            Object.assign({}, window.history.state || {}, { euromontGalleryPreview: true }),
            ""
        );
    }

    function openProductImage(trigger, source) {
        currentImages = productThumbnails.map(function (thumbnail, imageIndex) {
            return {
                src: thumbnail.currentSrc || thumbnail.src,
                alt: thumbnail.alt || "Fotografija proizvoda " + (imageIndex + 1)
            };
        });

        let index = currentImages.findIndex(function (item) {
            return item.src === source;
        });
        if (index === -1) {
            currentImages.push({
                src: source,
                alt: trigger.alt || "Fotografija proizvoda"
            });
            index = currentImages.length - 1;
        }

        previousFocus = trigger;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modal.hidden = false;
        showImage(index);
        closeButton.focus();
        window.history.pushState(
            Object.assign({}, window.history.state || {}, { euromontGalleryPreview: true }),
            ""
        );
    }

    function closeGallery() {
        if (window.history.state && window.history.state.euromontGalleryPreview) {
            window.history.back();
            return;
        }

        restoreGallery();
    }

    window.addEventListener("popstate", function () {
        if (!modal.hidden) {
            restoreGallery();
        }
    });

    image.addEventListener("load", function () {
        image.classList.remove("is-loading");
    });

    image.addEventListener("error", function () {
        image.classList.remove("is-loading");
        count.textContent = "Fotografija nije mogla da se učita";
    });

    previousButton.addEventListener("click", function () {
        showImage(currentIndex - 1);
    });

    nextButton.addEventListener("click", function () {
        showImage(currentIndex + 1);
    });

    if (productPreviousButton) {
        productPreviousButton.addEventListener("click", function () {
            showProductImage(-1);
        });
    }

    if (productNextButton) {
        productNextButton.addEventListener("click", function () {
            showProductImage(1);
        });
    }

    if (productImage) {
        productImage.addEventListener("touchstart", function (event) {
            const touch = event.changedTouches[0];
            productTouchStartX = touch.clientX;
            productTouchStartY = touch.clientY;
        }, { passive: true });

        productImage.addEventListener("touchend", function (event) {
            if (productTouchStartX === null || productTouchStartY === null) {
                return;
            }

            const touch = event.changedTouches[0];
            const deltaX = touch.clientX - productTouchStartX;
            const deltaY = touch.clientY - productTouchStartY;

            if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
                showProductImage(deltaX < 0 ? 1 : -1);
                suppressProductImageClickUntil = Date.now() + 700;
            }

            productTouchStartX = null;
            productTouchStartY = null;
        }, { passive: true });

        productImage.addEventListener("touchcancel", function () {
            productTouchStartX = null;
            productTouchStartY = null;
        }, { passive: true });
    }

    closeButton.addEventListener("click", closeGallery);

    document.addEventListener("click", function (event) {
        if (!(event.target instanceof Element)) {
            return;
        }

        const link = event.target.closest("#image-gallery .image .img-wrapper > a");
        if (link) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openGallery(links.indexOf(link), link);
            return;
        }

        if (!productImage) {
            return;
        }

        const thumbnailLink = event.target.closest(".product-links-wap a");
        if (thumbnailLink) {
            const thumbnail = thumbnailLink.querySelector("img");
            if (thumbnail) {
                event.preventDefault();
                openProductImage(thumbnailLink, thumbnail.currentSrc || thumbnail.src);
            }
            return;
        }

        if (event.target === productImage) {
            event.preventDefault();
            if (Date.now() < suppressProductImageClickUntil) {
                suppressProductImageClickUntil = 0;
                return;
            }
            openProductImage(productImage, productImage.currentSrc || productImage.src);
        }
    }, true);

    document.addEventListener("keydown", function (event) {
        if (productImage && event.target === productImage && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            openProductImage(productImage, productImage.currentSrc || productImage.src);
            return;
        }

        if (modal.hidden) {
            return;
        }

        if (event.key === "Escape" && !window.matchMedia("(max-width: 600px)").matches) {
            closeGallery();
        } else if (event.key === "ArrowLeft") {
            showImage(currentIndex - 1);
        } else if (event.key === "ArrowRight") {
            showImage(currentIndex + 1);
        } else if (event.key === "Tab") {
            const focusableButtons = [previousButton, nextButton, closeButton];
            const firstButton = focusableButtons[0];
            const lastButton = focusableButtons[focusableButtons.length - 1];

            if (event.shiftKey && document.activeElement === firstButton) {
                event.preventDefault();
                lastButton.focus();
            } else if (!event.shiftKey && document.activeElement === lastButton) {
                event.preventDefault();
                firstButton.focus();
            }
        }
    });

    modal.addEventListener("touchstart", function (event) {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    modal.addEventListener("touchend", function (event) {
        if (touchStartX === null || touchStartY === null) {
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
            showImage(currentIndex + (deltaX < 0 ? 1 : -1));
        }

        touchStartX = null;
        touchStartY = null;
    }, { passive: true });
})();
