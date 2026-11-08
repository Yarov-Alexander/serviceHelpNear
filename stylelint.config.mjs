export default {
  customSyntax: "postcss-scss",
  plugins: ["stylelint-scss"],
  rules: {
    "scss/at-rule-no-unknown": true,
    "selector-class-pattern": [
      "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?(?:--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?$",
      {
        message:
          "Expected a BEM class name: block, block__element, block--modifier, or block__element--modifier.",
      },
    ],
  },
};
