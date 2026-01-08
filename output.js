// src/js/app.js
var LANGUAGE_STORAGE_KEY = "catch-lang";
var isExpanded = (element) => (element == null ? void 0 : element.getAttribute("aria-expanded")) === "true";
var setExpanded = (element, value) => {
  if (element) {
    element.setAttribute("aria-expanded", value ? "true" : "false");
  }
};
var normalizeSearchText = (value) => {
  if (!value) return "";
  const map = {
    \u0131: "i",
    \u0130: "i",
    \u015F: "s",
    \u015E: "s",
    \u011F: "g",
    \u011E: "g",
    \u00FC: "u",
    \u00DC: "u",
    \u00F6: "o",
    \u00D6: "o",
    \u00E7: "c",
    \u00C7: "c"
  };
  return value.split("").map((char) => {
    var _a;
    return (_a = map[char]) != null ? _a : char;
  }).join("").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
var tokenizeSearchText = (value) => {
  if (!value) return [];
  return normalizeSearchText(value).split(/[^a-z0-9]+/g).filter(Boolean);
};
var setAccordionState = (item, isActive) => {
  if (!item) return;
  item.classList.toggle("accordion-item-active", isActive);
  const button = item.querySelector(".accordion-trigger");
  if (button) {
    button.setAttribute("aria-expanded", isActive ? "true" : "false");
  }
};
var initMobileMenu = () => {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!menuToggle || !mobileMenu) return;
  menuToggle.addEventListener("click", () => {
    const isOpen = isExpanded(menuToggle);
    setExpanded(menuToggle, !isOpen);
    menuToggle.setAttribute("aria-label", !isOpen ? "Men\xFCy\xFC Kapat" : "Men\xFCy\xFC A\xE7");
    mobileMenu.classList.toggle("is-open", !isOpen);
  });
  document.addEventListener("click", (event) => {
    const isClickInsideMenu = mobileMenu.contains(event.target);
    const isClickOnToggle = menuToggle.contains(event.target);
    const isOpen = isExpanded(menuToggle);
    if (!isClickInsideMenu && !isClickOnToggle && isOpen) {
      setExpanded(menuToggle, false);
      menuToggle.setAttribute("aria-label", "Men\xFCy\xFC A\xE7");
      mobileMenu.classList.remove("is-open");
    }
  });
  document.addEventListener("keydown", (event) => {
    const isOpen = isExpanded(menuToggle);
    if (event.key === "Escape" && isOpen) {
      setExpanded(menuToggle, false);
      menuToggle.setAttribute("aria-label", "Men\xFCy\xFC A\xE7");
      mobileMenu.classList.remove("is-open");
      menuToggle.focus();
    }
  });
};
var initLanguageSwitcher = () => {
  const desktopLanguageDropdown = document.getElementById("languageDropdown");
  const desktopLanguageMenu = document.getElementById("desktopLanguageMenu");
  const desktopLangOptions = document.querySelectorAll(".desktop-lang-option");
  const languageModalOverlay = document.getElementById("languageModalOverlay");
  const languageModalClose = document.getElementById("languageModalClose");
  const languageSaveButton = document.getElementById("languageSaveButton");
  const mobileLanguageDropdown = document.querySelector(".mobile-language-dropdown");
  const languageOptions = document.querySelectorAll(".language-option");
  const getStoredLanguage = () => {
    try {
      return sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  };
  const setStoredLanguage = (lang) => {
    try {
      sessionStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
    }
  };
  const resolveInitialLanguage = () => {
    var _a, _b;
    const stored = getStoredLanguage();
    if (stored) return stored;
    const activeMobile = document.querySelector(".language-option.active");
    if ((_a = activeMobile == null ? void 0 : activeMobile.dataset) == null ? void 0 : _a.lang) return activeMobile.dataset.lang;
    const activeDesktop = document.querySelector(".desktop-lang-option.active");
    if ((_b = activeDesktop == null ? void 0 : activeDesktop.dataset) == null ? void 0 : _b.lang) return activeDesktop.dataset.lang;
    if (languageOptions.length > 0) {
      const lang = languageOptions[0].getAttribute("data-lang");
      if (lang) return lang;
    }
    if (desktopLangOptions.length > 0) {
      const lang = desktopLangOptions[0].getAttribute("data-lang");
      if (lang) return lang;
    }
    return "en";
  };
  let currentLanguage = resolveInitialLanguage();
  let selectedLanguage = currentLanguage;
  if (!getStoredLanguage()) {
    setStoredLanguage(currentLanguage);
  }
  const setActiveState = (nodes, lang) => {
    nodes.forEach((node) => {
      if (node.getAttribute("data-lang") === lang) {
        node.classList.add("active");
      } else {
        node.classList.remove("active");
      }
    });
  };
  const updateMobileLanguageDisplay = (lang) => {
    if (!mobileLanguageDropdown) return;
    const languageText = mobileLanguageDropdown.querySelector(".language-text");
    const languageFlag = mobileLanguageDropdown.querySelector(".flag-icon");
    const selectedOption = document.querySelector(`.language-option[data-lang="${lang}"]`);
    if (languageText && selectedOption) {
      const label = selectedOption.querySelector(".language-name");
      if (label) {
        languageText.textContent = label.textContent;
      }
    }
    if (languageFlag && selectedOption) {
      const flag = selectedOption.querySelector(".language-flag");
      if (flag) {
        const newFlag = flag.cloneNode(true);
        languageFlag.replaceWith(newFlag);
        newFlag.classList.add("flag-icon");
        newFlag.classList.remove("language-flag");
      }
    }
  };
  const updateDesktopLanguageDisplay = (lang) => {
    if (!desktopLanguageDropdown) return;
    const dropdownFlag = desktopLanguageDropdown.querySelector(".flag-icon");
    const selectedOption = document.querySelector(`.desktop-lang-option[data-lang="${lang}"]`);
    if (dropdownFlag && selectedOption) {
      const flag = selectedOption.querySelector(".desktop-lang-flag");
      if (flag) {
        const newFlag = flag.cloneNode(true);
        dropdownFlag.replaceWith(newFlag);
        newFlag.classList.add("flag-icon");
        newFlag.classList.remove("desktop-lang-flag");
      }
    }
  };
  const syncLanguageUI = (lang) => {
    if (!lang) return;
    setActiveState(languageOptions, lang);
    setActiveState(desktopLangOptions, lang);
    updateMobileLanguageDisplay(lang);
    updateDesktopLanguageDisplay(lang);
  };
  const commitLanguage = (lang) => {
    if (!lang) return;
    currentLanguage = lang;
    selectedLanguage = lang;
    syncLanguageUI(lang);
    setStoredLanguage(lang);
  };
  syncLanguageUI(currentLanguage);
  if (desktopLanguageDropdown && desktopLanguageMenu) {
    desktopLanguageDropdown.addEventListener("click", () => {
      const isOpen = isExpanded(desktopLanguageDropdown);
      setExpanded(desktopLanguageDropdown, !isOpen);
      desktopLanguageMenu.classList.toggle("is-open", !isOpen);
    });
    document.addEventListener("click", (event) => {
      const isClickInsideMenu = desktopLanguageMenu.contains(event.target);
      const isClickOnDropdown = desktopLanguageDropdown.contains(event.target);
      const isOpen = isExpanded(desktopLanguageDropdown);
      if (!isClickInsideMenu && !isClickOnDropdown && isOpen) {
        setExpanded(desktopLanguageDropdown, false);
        desktopLanguageMenu.classList.remove("is-open");
      }
    });
  }
  desktopLangOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const lang = option.getAttribute("data-lang");
      if (lang) {
        commitLanguage(lang);
      }
      if (desktopLanguageDropdown && desktopLanguageMenu) {
        setExpanded(desktopLanguageDropdown, false);
        desktopLanguageMenu.classList.remove("is-open");
      }
    });
  });
  if (mobileLanguageDropdown && languageModalOverlay) {
    mobileLanguageDropdown.addEventListener("click", () => {
      languageModalOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  }
  const closeLanguageModal = () => {
    if (languageModalOverlay) {
      languageModalOverlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  };
  if (languageModalClose) {
    languageModalClose.addEventListener("click", closeLanguageModal);
  }
  if (languageModalOverlay) {
    languageModalOverlay.addEventListener("click", (event) => {
      if (event.target === languageModalOverlay) {
        closeLanguageModal();
      }
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && languageModalOverlay && languageModalOverlay.classList.contains("is-open")) {
      closeLanguageModal();
    }
  });
  languageOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const lang = option.getAttribute("data-lang");
      if (!lang) return;
      selectedLanguage = lang;
      setActiveState(languageOptions, lang);
    });
  });
  if (languageSaveButton) {
    languageSaveButton.addEventListener("click", () => {
      commitLanguage(selectedLanguage);
      closeLanguageModal();
    });
  }
};
var initTabs = () => {
  const tabsGroups = document.querySelectorAll("[data-tabs]");
  tabsGroups.forEach((group) => {
    var _a;
    const tabItems = group.querySelectorAll(".tab-item");
    const tabContents = group.querySelectorAll(".tab-content");
    if (tabItems.length === 0 || tabContents.length === 0) return;
    const setActiveTab = (tabName) => {
      tabItems.forEach((item) => {
        item.classList.toggle("active", item.dataset.tab === tabName);
      });
      tabContents.forEach((content) => {
        content.classList.toggle("active", content.id === `content-${tabName}`);
      });
    };
    const activeItem = Array.from(tabItems).find((item) => item.classList.contains("active"));
    const initialTab = ((_a = activeItem == null ? void 0 : activeItem.dataset) == null ? void 0 : _a.tab) || tabItems[0].dataset.tab;
    if (initialTab) {
      setActiveTab(initialTab);
    }
    tabItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (item.dataset.tab) {
          setActiveTab(item.dataset.tab);
        }
      });
    });
  });
};
var initAccordions = () => {
  const accordions = document.querySelectorAll(".accordion");
  accordions.forEach((accordion) => {
    const items = accordion.querySelectorAll(".accordion-item");
    const triggers = accordion.querySelectorAll(".accordion-trigger");
    items.forEach((item) => {
      setAccordionState(item, item.classList.contains("accordion-item-active"));
    });
    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".accordion-item");
        if (!item) return;
        const isActive = item.classList.contains("accordion-item-active");
        items.forEach((entry) => {
          if (entry !== item) {
            setAccordionState(entry, false);
          }
        });
        setAccordionState(item, !isActive);
      });
    });
  });
};
var initFaqSection = (root) => {
  const accordion = root.querySelector(".accordion");
  if (!accordion) return;
  const accordionItems = accordion.querySelectorAll(".accordion-item");
  const tabs = root.querySelectorAll(".filter-tab");
  const searchInputs = root.querySelectorAll(".filter-search-field");
  const clearButtons = root.querySelectorAll(".filter-clear-button");
  const resultsInfo = root.querySelector(".filter-results-info");
  const resultsCount = root.querySelector(".filter-results-count");
  const noResultsAlert = root.querySelector(".filter-no-results-alert");
  const resetButton = root.querySelector(".filter-reset-button");
  const setFaqTabState = (tab, isActive) => {
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("btn-secondary", isActive);
    tab.classList.toggle("btn-secondary-outline", !isActive);
  };
  const clearActiveFaqTabs = () => {
    tabs.forEach((tab) => {
      setFaqTabState(tab, false);
    });
  };
  const clearFaqSearch = () => {
    searchInputs.forEach((input) => {
      if (input.value) {
        input.value = "";
      }
    });
    updateClearButtonVisibility();
    updateResultsDisplay();
  };
  const updateClearButtonVisibility = () => {
    searchInputs.forEach((input, index) => {
      const clearButton = clearButtons[index];
      if (clearButton) {
        clearButton.style.display = input.value ? "flex" : "none";
      }
    });
  };
  const updateResultsDisplay = () => {
    const visibleCount = Array.from(accordionItems).filter((item) => !item.hidden).length;
    const hasSearch = Array.from(searchInputs).some((input) => input.value.trim());
    const hasActiveCategory = accordion.dataset.activeCategory;
    if (resultsCount) {
      resultsCount.textContent = `${visibleCount} adet sonu\xE7 bulundu`;
    }
    if (resultsInfo) {
      resultsInfo.style.display = hasSearch || hasActiveCategory ? "flex" : "none";
    }
    if (noResultsAlert) {
      noResultsAlert.style.display = (hasSearch || hasActiveCategory) && visibleCount === 0 ? "flex" : "none";
    }
  };
  const applyFaqFilter = (category) => {
    accordion.dataset.activeCategory = category;
    accordionItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      const shouldShow = itemCategory === category;
      item.hidden = !shouldShow;
      if (!shouldShow) {
        setAccordionState(item, false);
      }
    });
    updateResultsDisplay();
  };
  const selectFaqTab = (tab) => {
    const category = tab == null ? void 0 : tab.getAttribute("data-category");
    if (!category) return;
    clearFaqSearch();
    tabs.forEach((entry) => setFaqTabState(entry, entry === tab));
    applyFaqFilter(category);
  };
  const resetFilters = () => {
    clearFaqSearch();
    clearActiveFaqTabs();
    accordion.dataset.activeCategory = "";
    accordionItems.forEach((item) => {
      item.hidden = false;
    });
    if (tabs.length > 0) {
      const initialTab = Array.from(tabs).find((tab) => tab.classList.contains("active")) || tabs[0];
      selectFaqTab(initialTab);
    }
    updateResultsDisplay();
  };
  if (tabs.length > 0) {
    const initialTab = Array.from(tabs).find((tab) => tab.classList.contains("active")) || tabs[0];
    selectFaqTab(initialTab);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        selectFaqTab(tab);
      });
    });
  }
  accordionItems.forEach((item) => {
    const question = item.getAttribute("data-question") || "";
    const answer = item.getAttribute("data-answer") || "";
    item.dataset.searchTokens = tokenizeSearchText(`${question} ${answer}`).join(" ");
  });
  const applySearchFilter = (query) => {
    const queryTokens = tokenizeSearchText(query);
    const activeCategory = accordion.dataset.activeCategory;
    accordionItems.forEach((item) => {
      const itemCategory = item.getAttribute("data-category");
      const matchesCategory = !activeCategory || itemCategory === activeCategory;
      const itemTokens = (item.dataset.searchTokens || "").split(" ").filter(Boolean);
      const itemTokenSet = new Set(itemTokens);
      const matchesQuery = queryTokens.length === 0 || queryTokens.every((token) => itemTokenSet.has(token));
      const shouldShow = matchesCategory && matchesQuery;
      item.hidden = !shouldShow;
      if (!shouldShow) {
        setAccordionState(item, false);
      }
    });
    updateResultsDisplay();
  };
  searchInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      updateClearButtonVisibility();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      accordion.dataset.activeCategory = "";
      clearActiveFaqTabs();
      applySearchFilter(input.value);
    });
    const clearButton = clearButtons[index];
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        input.value = "";
        updateClearButtonVisibility();
        accordion.dataset.activeCategory = "";
        clearActiveFaqTabs();
        applySearchFilter("");
      });
    }
  });
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }
  updateResultsDisplay();
};
var initPressSection = (root) => {
  const cards = root.querySelectorAll(".card-list-item");
  if (cards.length === 0) return;
  const tabs = root.querySelectorAll(".filter-tab");
  const searchInputs = root.querySelectorAll(".filter-search-field");
  const clearButtons = root.querySelectorAll(".filter-clear-button");
  const resultsInfo = root.querySelector(".filter-results-info");
  const resultsCount = root.querySelector(".filter-results-count");
  const noResultsAlert = root.querySelector(".filter-no-results-alert");
  const resetButton = root.querySelector(".filter-reset-button");
  const setPressTabState = (tab, isActive) => {
    tab.classList.toggle("active", isActive);
    tab.classList.toggle("btn-secondary", isActive);
    tab.classList.toggle("btn-secondary-outline", !isActive);
  };
  const clearActiveTabs = () => {
    tabs.forEach((tab) => {
      setPressTabState(tab, false);
    });
  };
  const clearSearchInputs = () => {
    searchInputs.forEach((input) => {
      if (input.value) {
        input.value = "";
      }
    });
    updateClearButtonVisibility();
    updateResultsDisplay();
  };
  const updateClearButtonVisibility = () => {
    searchInputs.forEach((input, index) => {
      const clearButton = clearButtons[index];
      if (clearButton) {
        clearButton.style.display = input.value ? "flex" : "none";
      }
    });
  };
  const updateResultsDisplay = () => {
    const visibleCount = Array.from(cards).filter((card) => !card.hidden).length;
    const hasSearch = Array.from(searchInputs).some((input) => input.value.trim());
    const hasActiveCategory = root.dataset.activeCategory;
    if (resultsCount) {
      resultsCount.textContent = `${visibleCount} adet sonu\xE7 bulundu`;
    }
    if (resultsInfo) {
      resultsInfo.style.display = hasSearch || hasActiveCategory ? "flex" : "none";
    }
    if (noResultsAlert) {
      noResultsAlert.style.display = (hasSearch || hasActiveCategory) && visibleCount === 0 ? "flex" : "none";
    }
  };
  const applyCategoryFilter = (category) => {
    root.dataset.activeCategory = category;
    cards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category");
      const shouldShow = !category || cardCategory === category;
      card.hidden = !shouldShow;
    });
    updateResultsDisplay();
  };
  const selectTab = (tab) => {
    const category = tab == null ? void 0 : tab.getAttribute("data-category");
    if (!category) return;
    clearSearchInputs();
    tabs.forEach((entry) => setPressTabState(entry, entry === tab));
    applyCategoryFilter(category);
  };
  const resetFilters = () => {
    clearSearchInputs();
    clearActiveTabs();
    root.dataset.activeCategory = "";
    cards.forEach((card) => {
      card.hidden = false;
    });
    if (tabs.length > 0) {
      const initialTab = Array.from(tabs).find((tab) => tab.classList.contains("active")) || tabs[0];
      selectTab(initialTab);
    }
    updateResultsDisplay();
  };
  if (tabs.length > 0) {
    const initialTab = Array.from(tabs).find((tab) => tab.classList.contains("active")) || tabs[0];
    selectTab(initialTab);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        selectTab(tab);
      });
    });
  }
  cards.forEach((card) => {
    var _a, _b;
    const title = ((_a = card.querySelector(".card-list-title")) == null ? void 0 : _a.textContent) || "";
    const source = ((_b = card.querySelector(".card-list-source")) == null ? void 0 : _b.textContent) || "";
    card.dataset.searchTokens = tokenizeSearchText(`${title} ${source}`).join(" ");
  });
  const applySearchFilter = (query) => {
    const queryTokens = tokenizeSearchText(query);
    const activeCategory = root.dataset.activeCategory;
    cards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category");
      const matchesCategory = !activeCategory || cardCategory === activeCategory;
      const cardTokens = (card.dataset.searchTokens || "").split(" ").filter(Boolean);
      const cardTokenSet = new Set(cardTokens);
      const matchesQuery = queryTokens.length === 0 || queryTokens.every((token) => cardTokenSet.has(token));
      const shouldShow = matchesCategory && matchesQuery;
      card.hidden = !shouldShow;
    });
    updateResultsDisplay();
  };
  searchInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      updateClearButtonVisibility();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      root.dataset.activeCategory = "";
      clearActiveTabs();
      applySearchFilter(input.value);
    });
    const clearButton = clearButtons[index];
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        input.value = "";
        updateClearButtonVisibility();
        root.dataset.activeCategory = "";
        clearActiveTabs();
        applySearchFilter("");
      });
    }
  });
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }
  updateResultsDisplay();
};
var initFaqSections = () => {
  const faqSections = document.querySelectorAll(".faq-section");
  faqSections.forEach((section) => initFaqSection(section));
};
var initPressSections = () => {
  const pressSections = document.querySelectorAll(".press-page");
  pressSections.forEach((section) => initPressSection(section));
};
var initContactForms = () => {
  const forms = document.querySelectorAll("[data-contact-form]");
  forms.forEach((form) => {
    const countryToggle = form.querySelector(".phone-country");
    const countryList = form.querySelector(".phone-country-list");
    const countryOptions = Array.from(form.querySelectorAll(".phone-country-option"));
    const countryCode = form.querySelector(".phone-code");
    const countryFlag = form.querySelector(".phone-flag use");
    const countryValue = form.querySelector(".phone-country-value");
    const fileInput = form.querySelector(".file-input");
    const fileButton = form.querySelector(".file-btn");
    const fileText = form.querySelector(".file-text");
    const textarea = form.querySelector(".textarea-field");
    const charCount = form.querySelector(".char-count");
    const submitButton = form.querySelector('button[type="submit"]');
    const clearButton = form.querySelector('.form-actions button[type="button"]');
    const status = form.querySelector(".form-status");
    const initialFileText = (fileText == null ? void 0 : fileText.textContent) || "";
    const initialCountry = {
      display: (countryCode == null ? void 0 : countryCode.textContent) || "",
      flag: (countryFlag == null ? void 0 : countryFlag.getAttribute("href")) || "",
      code: (countryValue == null ? void 0 : countryValue.value) || ""
    };
    const setStatus = (message, isError = false) => {
      if (!status) return;
      status.textContent = message;
      status.style.color = isError ? "var(--color-error-text, #B42318)" : "";
    };
    const updateSubmitState = () => {
      if (!submitButton) return;
      submitButton.disabled = !form.checkValidity();
    };
    const setDropdownOpen = (isOpen) => {
      if (!countryToggle) return;
      countryToggle.classList.toggle("open", isOpen);
      countryToggle.dataset.open = isOpen ? "true" : "false";
      countryToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };
    const setCountry = (option) => {
      var _a;
      if (!option) return;
      const display = option.dataset.display || ((_a = option.textContent) == null ? void 0 : _a.trim()) || "";
      const flag = option.dataset.flag;
      const code = option.dataset.code || option.dataset.display || "";
      if (countryCode) {
        countryCode.textContent = display;
      }
      if (countryFlag && flag) {
        countryFlag.setAttribute("href", `#${flag}`);
      }
      if (countryValue) {
        countryValue.value = code || display;
      }
      countryOptions.forEach((entry) => entry.classList.toggle("active", entry === option));
    };
    if (countryToggle && countryList) {
      countryToggle.addEventListener("click", (event) => {
        if (event.target.closest(".phone-country-list")) return;
        const isOpen = countryToggle.dataset.open === "true";
        setDropdownOpen(!isOpen);
      });
      countryOptions.forEach((option) => {
        option.addEventListener("click", () => {
          setCountry(option);
          setDropdownOpen(false);
        });
      });
      document.addEventListener("click", (event) => {
        if (!countryToggle.contains(event.target)) {
          setDropdownOpen(false);
        }
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          setDropdownOpen(false);
        }
      });
    }
    if (fileButton && fileInput) {
      fileButton.addEventListener("click", () => {
        fileInput.click();
      });
    }
    if (fileInput && fileText) {
      fileInput.addEventListener("change", () => {
        if (!fileInput.files || fileInput.files.length === 0) {
          fileText.textContent = initialFileText;
          return;
        }
        if (fileInput.files.length === 1) {
          fileText.textContent = fileInput.files[0].name;
          return;
        }
        fileText.textContent = `${fileInput.files.length} dosya secildi`;
      });
    }
    const updateCharCount = () => {
      if (!textarea || !charCount) return;
      const maxLength = Number(textarea.getAttribute("maxlength")) || 0;
      const current = textarea.value.length;
      if (maxLength > 0) {
        charCount.textContent = `${current}/${maxLength}`;
      } else {
        charCount.textContent = `${current}`;
      }
    };
    if (textarea && charCount) {
      textarea.addEventListener("input", updateCharCount);
      updateCharCount();
    }
    const requiredFields = Array.from(form.querySelectorAll("[required]"));
    requiredFields.forEach((field) => {
      field.addEventListener("input", updateSubmitState);
      field.addEventListener("change", updateSubmitState);
    });
    updateSubmitState();
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        form.reset();
        if (fileText) {
          fileText.textContent = initialFileText;
        }
        if (countryCode) {
          countryCode.textContent = initialCountry.display;
        }
        if (countryFlag && initialCountry.flag) {
          countryFlag.setAttribute("href", initialCountry.flag);
        }
        if (countryValue) {
          countryValue.value = initialCountry.code || initialCountry.display;
        }
        const activeOption = countryOptions.find((option) => option.classList.contains("active"));
        if (activeOption) {
          setCountry(activeOption);
        }
        setStatus("");
        updateCharCount();
        updateSubmitState();
      });
    }
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        updateSubmitState();
        return;
      }
      const originalText = (submitButton == null ? void 0 : submitButton.textContent) || "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Gonderiliyor...";
      }
      setStatus("Gonderiliyor...");
      const formData = new FormData(form);
      const endpoint = form.getAttribute("action") || "https://example.com/contact";
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });
        if (!response.ok) {
          throw new Error("Request failed");
        }
        form.reset();
        if (fileText) {
          fileText.textContent = initialFileText;
        }
        if (countryCode) {
          countryCode.textContent = initialCountry.display;
        }
        if (countryFlag && initialCountry.flag) {
          countryFlag.setAttribute("href", initialCountry.flag);
        }
        if (countryValue) {
          countryValue.value = initialCountry.code || initialCountry.display;
        }
        updateCharCount();
        setStatus("Form basariyla gonderildi.");
      } catch (error) {
        setStatus("Gonderim basarisiz oldu. Lutfen tekrar deneyin.", true);
      } finally {
        if (submitButton) {
          submitButton.textContent = originalText;
          updateSubmitState();
        }
      }
    });
  });
};
var initTestimonialsSection = (section) => {
  const track = section.querySelector(".testimonials-track");
  const cards = Array.from(section.querySelectorAll(".testimonial-card"));
  const prevButton = section.querySelector(".carousel-btn-prev");
  const nextButton = section.querySelector(".carousel-btn-next");
  if (!track || cards.length === 0) return;
  const setButtonDisabled = (button, disabled) => {
    if (!button) return;
    if (disabled) {
      button.setAttribute("disabled", "disabled");
    } else {
      button.removeAttribute("disabled");
    }
  };
  const setState = () => {
    const orderedCards = Array.from(track.querySelectorAll(".testimonial-card"));
    orderedCards.forEach((card) => {
      card.classList.remove("is-active", "is-peek");
    });
    if (orderedCards.length === 0) return;
    orderedCards[0].classList.add("is-active");
    if (orderedCards.length > 1) {
      orderedCards[1].classList.add("is-peek");
    }
  };
  if (cards.length < 2) {
    setState();
    setButtonDisabled(prevButton, true);
    setButtonDisabled(nextButton, true);
    return;
  }
  setState();
  let isAnimating = false;
  const slide = (direction) => {
    if (isAnimating) return;
    isAnimating = true;
    track.classList.add("is-sliding");
    window.setTimeout(() => {
      if (direction > 0) {
        const firstCard = track.firstElementChild;
        if (firstCard) {
          track.appendChild(firstCard);
        }
      } else {
        const lastCard = track.lastElementChild;
        if (lastCard) {
          track.insertBefore(lastCard, track.firstElementChild);
        }
      }
      track.classList.remove("is-sliding");
      setState();
      isAnimating = false;
    }, 1200);
  };
  if (prevButton) {
    prevButton.addEventListener("click", () => slide(-1));
  }
  if (nextButton) {
    nextButton.addEventListener("click", () => slide(1));
  }
};
var initTestimonialsSections = () => {
  const testimonialsSections = document.querySelectorAll(".testimonials-section");
  testimonialsSections.forEach((section) => initTestimonialsSection(section));
};
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initLanguageSwitcher();
  initTabs();
  initAccordions();
  initFaqSections();
  initPressSections();
  initContactForms();
  initTestimonialsSections();
});
