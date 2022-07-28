const {
  convertToJS
} = require("../src/index.cjs")

function checkLines(response, lines) {
  const toCheck = response.split("\n")
  let count = 0
  for (let line of lines) {
    expect(toCheck[count++]).toBe(line)
  }
}

describe("Test that the string processing works correctly", () => {
  it("should convert string without HBS", () => {
    const response = convertToJS("Hello my name is Michael")
    expect(response).toBe("return `Hello my name is Michael`;")
  })

  it("basic example with square brackets", () => {
    const response = convertToJS("{{ [query] }}")
    checkLines(response, [
      "const var1 = $(\"[query]\");",
      "return `${var1}`;",
    ])
  })

  it("should convert some basic HBS strings", () => {
    const response = convertToJS("Hello {{ name }}, welcome to {{ company }}!")
    checkLines(response, [
      "const var1 = $(\"name\");",
      "const var2 = $(\"company\");",
      "return `Hello ${var1}, welcome to ${var2}`;",
    ])
  })

  it("should handle a helper block", () => {
    const response = convertToJS("This is the average: {{ avg array }}")
    checkLines(response, [
      "const var1 = helpers.avg($(\"array\"));",
      "return `This is the average: ${var1}`;",
    ])
  })

  it("should handle multi-variable helper", () => {
    const response = convertToJS("This is the average: {{ join ( avg val1 val2 val3 ) }}")
    checkLines(response, [
      "const var1 = helpers.join(helpers.avg(...[$(\"val1\"), $(\"val2\"), $(\"val3\")]));",
      "return `This is the average: ${var1}`;",
    ])
  })

  it("should handle a complex statement", () => {
    const response = convertToJS("This is the average: {{ join ( avg val1 val2 val3 ) val4 }}")
    checkLines(response, [
      "const var1 = helpers.join(...[helpers.avg(...[$(\"val1\"), $(\"val2\"), $(\"val3\")]), $(\"val4\")]);",
      "return `This is the average: ${var1}`;",
    ])
  })

  it("should handle square brackets", () => {
    const response = convertToJS("This is: {{ [val thing] }}")
    checkLines(response, [
      "const var1 = $(\"[val thing]\");",
      "return `This is: ${var1}`;",
    ])
  })

  it("should handle square brackets with properties", () => {
    const response = convertToJS("{{ [user].[_id] }}")
    checkLines(response, [
      "const var1 = $(\"[user].[_id]\");",
      "return `${var1}`;",
    ])
  })

  it("should handle multiple complex statements", () => {
    const response = convertToJS("average: {{ avg ( abs val1 ) val2 }} add: {{ add 1 2 }}")
    checkLines(response, [
      "const var1 = helpers.avg(...[helpers.abs($(\"val1\")), $(\"val2\")]);",
      "const var2 = helpers.add(...[1, 2]);",
      "return `average: ${var1} add: ${var2}`;",
    ])
  })
})