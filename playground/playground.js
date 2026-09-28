const SCHEMA = {
  number: {
    value: {
      tag: "input",
      placeholder: "123456",
      inputmode: "numeric",
      def: "123456",
      hint: "A number or a numeric string. Text that is not a number is returned unchanged, and identifiers are never grouped.",
    },
    options: [
      {
        key: "locale",
        label: "Locale",
        type: "select",
        values: ["ar", "en"],
        def: "en",
      },
      {
        key: "digits",
        label: "Digits",
        type: "select",
        values: ["auto", "arabic", "latin"],
        def: "auto",
      },
      { key: "group", label: "Grouping", type: "checkbox", def: false },
    ],
  },
  digits: {
    value: {
      tag: "input",
      placeholder: "Order #2026",
      def: "Order #2026",
      hint: "Any text. Latin, Arabic-Indic and Persian digits are all recognised; letters, punctuation and separators are left alone.",
    },
    options: [
      {
        key: "digits",
        label: "Digits",
        type: "select",
        values: ["arabic", "latin"],
        def: "arabic",
        positional: true,
      },
    ],
  },
  date: {
    value: {
      tag: "input",
      placeholder: "2026-09-28",
      inputmode: "numeric",
      def: "2026-09-28",
      hint: "An ISO calendar date such as 2026-09-28. Unparsable input is returned unchanged.",
    },
    options: [
      {
        key: "locale",
        label: "Locale",
        type: "select",
        values: ["ar", "en"],
        def: "en",
      },
      {
        key: "month",
        label: "Month",
        type: "select",
        values: ["none", "short", "long"],
        def: "none",
      },
      { key: "weekday", label: "Weekday", type: "checkbox", def: false },
    ],
  },
  time: {
    value: {
      tag: "input",
      placeholder: "18:30",
      inputmode: "numeric",
      def: "18:30",
      hint: "A wall-clock time such as 18:30 or 18:30:45.",
    },
    options: [
      {
        key: "locale",
        label: "Locale",
        type: "select",
        values: ["ar", "en"],
        def: "en",
      },
      {
        key: "digits",
        label: "Digits",
        type: "select",
        values: ["auto", "arabic", "latin"],
        def: "auto",
      },
      { key: "hour12", label: "12-hour", type: "checkbox", def: false },
      { key: "seconds", label: "Seconds", type: "checkbox", def: false },
    ],
  },
  stretch: {
    value: {
      tag: "textarea",
      placeholder: "مرحبا",
      def: "مرحبا",
      hint: "Arabic text. Leave the amount empty to use the library default of 1.",
    },
    options: [
      {
        key: "amount",
        label: "Amount",
        type: "number",
        min: "0",
        max: "12",
        step: "1",
        def: "2",
        positional: true,
        optional: true,
      },
    ],
  },
};

const NUMERIC_LITERAL = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const ARABIC = /[؀-ۿ]/;
const LATIN = /[A-Za-z]/;
const COPY_RESET_MS = 3000;

const select = document.getElementById("function");
const valueSlot = document.getElementById("value-slot");
const valueHint = document.getElementById("value-hint");
const optionsSlot = document.getElementById("options");
const resultEl = document.getElementById("result");
const codeEl = document.getElementById("code");
const errorEl = document.getElementById("error");
const statusEl = document.getElementById("status");
const copyButton = document.getElementById("copy");
const panel = document.querySelector(".panel");

const state = { values: {}, options: {} };
let active = "number";
let valueControl = null;
let statusTimer = null;

const optionId = (key) => `opt-${key}`;

const isRtl = (text) => ARABIC.test(text) && !LATIN.test(text);

const isExactLiteral = (text) =>
  NUMERIC_LITERAL.test(text) &&
  Math.abs(Number(text)) <= Number.MAX_SAFE_INTEGER;

const showError = (message) => {
  errorEl.textContent = message;
  errorEl.hidden = false;
};

const clearError = () => {
  errorEl.textContent = "";
  errorEl.hidden = true;
};

const setStatus = (message) => {
  statusEl.textContent = message;
  statusEl.hidden = false;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    statusEl.hidden = true;
  }, COPY_RESET_MS);
};

const storedOption = (option) =>
  option.key in (state.options[active] ?? {})
    ? state.options[active][option.key]
    : option.def;

const readOptions = (spec) => {
  const values = {};

  for (const option of spec.options) {
    const control = document.getElementById(optionId(option.key));
    values[option.key] =
      option.type === "checkbox" ? control.checked : control.value;
  }

  return values;
};

const buildValueControl = (spec) => {
  const config = spec.value;
  const control = document.createElement(config.tag);

  control.id = "value";
  control.name = "value";
  control.placeholder = config.placeholder;
  control.dir = "auto";
  control.setAttribute("aria-describedby", "value-hint");
  control.value = state.values[active] ?? config.def;

  if (config.tag === "textarea") {
    control.rows = 2;
  } else {
    control.type = "text";
    if (config.inputmode) {
      control.inputMode = config.inputmode;
    }
  }

  return control;
};

const buildOption = (option) => {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const id = optionId(option.key);

  label.htmlFor = id;
  label.textContent = option.label;
  wrapper.className = "option";

  if (option.type === "select") {
    const control = document.createElement("select");

    control.id = id;
    control.name = option.key;

    for (const value of option.values) {
      const choice = document.createElement("option");

      choice.value = value;
      choice.textContent = value;
      control.append(choice);
    }

    control.value = storedOption(option);
    wrapper.append(label, control);
    return wrapper;
  }

  const control = document.createElement("input");

  control.id = id;
  control.name = option.key;
  control.type = option.type === "checkbox" ? "checkbox" : "number";
  control.value = storedOption(option);

  if (option.type === "checkbox") {
    control.checked = Boolean(storedOption(option));
    wrapper.classList.add("option-inline");
    wrapper.append(control, label);
  } else {
    control.min = option.min;
    control.max = option.max;
    control.step = option.step;
    wrapper.append(label, control);
  }

  return wrapper;
};

const buildArgs = (spec, raw, values) => {
  const args = [raw];

  for (const option of spec.options) {
    if (!option.positional) {
      continue;
    }

    const value = values[option.key];

    if (option.optional && value === "") {
      continue;
    }

    args.push(option.type === "number" ? Number(value) : value);
  }

  const options = {};

  for (const option of spec.options) {
    if (option.positional) {
      continue;
    }

    const value = values[option.key];

    if (value !== option.def) {
      options[option.key] = value;
    }
  }

  if (Object.keys(options).length > 0) {
    args.push(options);
  }

  return args;
};

const renderValue = (value, allowLiteral = false) => {
  if (typeof value === "string") {
    return allowLiteral && isExactLiteral(value)
      ? value
      : JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value !== null && typeof value === "object") {
    const body = Object.entries(value)
      .map(([key, item]) => `${key}: ${renderValue(item)}`)
      .join(", ");

    return `{ ${body} }`;
  }

  return JSON.stringify(value);
};

const renderCode = (name, args) => {
  const parts = args.map((arg, index) =>
    renderValue(arg, name === "number" && index === 0),
  );

  return `${name}(${parts.join(", ")})`;
};

const save = () => {
  const spec = SCHEMA[active];

  state.values[active] = valueControl.value;
  state.options[active] = readOptions(spec);
};

const run = (api) => {
  const spec = SCHEMA[active];
  const args = buildArgs(spec, valueControl.value, readOptions(spec));

  codeEl.textContent = renderCode(active, args);

  try {
    const result = String(api[active](...args));

    resultEl.textContent = result;
    resultEl.dir = isRtl(result) ? "rtl" : "ltr";
    clearError();
  } catch {
    resultEl.textContent = "—";
    resultEl.dir = "ltr";
    showError(`Could not format this input with ${active}().`);
  }
};

const render = (api) => {
  const spec = SCHEMA[active];

  valueControl = buildValueControl(spec);
  valueSlot.replaceChildren(valueControl);
  valueHint.textContent = spec.value.hint;
  optionsSlot.replaceChildren(...spec.options.map(buildOption));

  valueControl.addEventListener("input", () => run(api));

  for (const option of spec.options) {
    document
      .getElementById(optionId(option.key))
      .addEventListener("change", () => run(api));
  }

  run(api);
};

const start = (api) => {
  for (const name of Object.keys(SCHEMA)) {
    const option = document.createElement("option");

    option.value = name;
    option.textContent = `${name}()`;
    select.append(option);
  }

  select.value = active;

  select.addEventListener("change", () => {
    save();
    active = select.value;
    render(api);
  });

  copyButton.addEventListener("click", async () => {
    const text = resultEl.textContent;

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Result copied to the clipboard.");
    } catch {
      setStatus(
        "Copying is blocked in this browser. Select the result and copy it manually.",
      );
    }
  });

  render(api);
};

const showLoadError = () => {
  showError(
    "The playground could not load arabic-kit. Build the project with `npm run build`, serve the repository over HTTP, then reload this page.",
  );

  for (const control of panel.querySelectorAll(
    "input, select, textarea, button",
  )) {
    control.disabled = true;
  }
};

import("arabic-kit").then(start, showLoadError);
