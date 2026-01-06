import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { 
  capitalize, 
  camelCase, 
  snakeCase, 
  kebabCase, 
  pascalCase, 
  titleCase, 
  sentenceCase, 
  reverse, 
  truncate, 
  padLeft, 
  padRight, 
  trim, 
  trimLeft, 
  trimRight, 
  removeWhitespace, 
  removeSpecialChars, 
  escapeHtml, 
  unescapeHtml, 
  escapeRegex, 
  slugify, 
  pluralize, 
  singularize, 
  camelize, 
  underscore, 
  dasherize, 
  humanize, 
  parameterize, 
  classify, 
  foreignKey, 
  ordinalize, 
  interpolate, 
  repeat, 
  count, 
  countWords, 
  countChars, 
  countLines, 
  isEmpty, 
  isBlank, 
  isNotEmpty, 
  isNotBlank, 
  includes, 
  startsWith, 
  endsWith, 
  contains, 
  matches, 
  replace, 
  replaceAll, 
  split, 
  join, 
  slice, 
  substring, 
  substr, 
  toLowerCase, 
  toUpperCase, 
  toLocaleLowerCase, 
  toLocaleUpperCase, 
  toCamelCase, 
  toSnakeCase, 
  toKebabCase, 
  toPascalCase, 
  toTitleCase, 
  toSentenceCase, 
  toLowerCaseFirst, 
  toUpperCaseFirst, 
  reverseString, 
  truncateString, 
  padString, 
  trimString, 
  escapeString, 
  unescapeString, 
  slugifyString, 
  pluralizeString, 
  singularizeString, 
  formatString, 
  template 
} from '@/utils/string-utils'

// 控制台错误检测变量
let consoleSpy: any

describe('String Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('hello world')).toBe('Hello world')
      expect(capitalize('HELLO')).toBe('HELLO')
    })

    it('should capitalize all words', () => {
      expect(capitalize('hello world', true)).toBe('Hello World')
      expect(capitalize('this is a test', true)).toBe('This Is A Test')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(capitalize('h')).toBe('H')
      expect(capitalize('H')).toBe('H')
    })

    it('should handle null/undefined input', () => {
      expect(capitalize(null as any)).toBe('')
      expect(capitalize(undefined as any)).toBe('')
    })
  })

  describe('camelCase', () => {
    it('should convert to camelCase', () => {
      expect(camelCase('hello world')).toBe('helloWorld')
      expect(camelCase('Hello World')).toBe('helloWorld')
      expect(camelCase('hello-world')).toBe('helloWorld')
      expect(camelCase('hello_world')).toBe('helloWorld')
    })

    it('should handle multiple spaces and separators', () => {
      expect(camelCase('hello   world')).toBe('helloWorld')
      expect(camelCase('hello--world')).toBe('helloWorld')
      expect(camelCase('hello__world')).toBe('helloWorld')
    })

    it('should handle single word', () => {
      expect(camelCase('hello')).toBe('hello')
      expect(camelCase('Hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(camelCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(camelCase(null as any)).toBe('')
      expect(camelCase(undefined as any)).toBe('')
    })
  })

  describe('snakeCase', () => {
    it('should convert to snake_case', () => {
      expect(snakeCase('hello world')).toBe('hello_world')
      expect(snakeCase('Hello World')).toBe('hello_world')
      expect(snakeCase('hello-world')).toBe('hello_world')
      expect(snakeCase('helloWorld')).toBe('hello_world')
    })

    it('should handle multiple spaces and separators', () => {
      expect(snakeCase('hello   world')).toBe('hello_world')
      expect(snakeCase('hello--world')).toBe('hello_world')
      expect(snakeCase('helloWorld')).toBe('hello_world')
    })

    it('should handle single word', () => {
      expect(snakeCase('hello')).toBe('hello')
      expect(snakeCase('Hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(snakeCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(snakeCase(null as any)).toBe('')
      expect(snakeCase(undefined as any)).toBe('')
    })
  })

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(kebabCase('hello world')).toBe('hello-world')
      expect(kebabCase('Hello World')).toBe('hello-world')
      expect(kebabCase('hello_world')).toBe('hello-world')
      expect(kebabCase('helloWorld')).toBe('hello-world')
    })

    it('should handle multiple spaces and separators', () => {
      expect(kebabCase('hello   world')).toBe('hello-world')
      expect(kebabCase('hello__world')).toBe('hello-world')
      expect(kebabCase('helloWorld')).toBe('hello-world')
    })

    it('should handle single word', () => {
      expect(kebabCase('hello')).toBe('hello')
      expect(kebabCase('Hello')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(kebabCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(kebabCase(null as any)).toBe('')
      expect(kebabCase(undefined as any)).toBe('')
    })
  })

  describe('pascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(pascalCase('hello world')).toBe('HelloWorld')
      expect(pascalCase('Hello World')).toBe('HelloWorld')
      expect(pascalCase('hello-world')).toBe('HelloWorld')
      expect(pascalCase('hello_world')).toBe('HelloWorld')
    })

    it('should handle multiple spaces and separators', () => {
      expect(pascalCase('hello   world')).toBe('HelloWorld')
      expect(pascalCase('hello--world')).toBe('HelloWorld')
      expect(pascalCase('hello__world')).toBe('HelloWorld')
    })

    it('should handle single word', () => {
      expect(pascalCase('hello')).toBe('Hello')
      expect(pascalCase('Hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(pascalCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(pascalCase(null as any)).toBe('')
      expect(pascalCase(undefined as any)).toBe('')
    })
  })

  describe('titleCase', () => {
    it('should convert to Title Case', () => {
      expect(titleCase('hello world')).toBe('Hello World')
      expect(titleCase('hello world test')).toBe('Hello World Test')
    })

    it('should handle mixed case', () => {
      expect(titleCase('hELLO wORLD')).toBe('Hello World')
      expect(titleCase('Hello World')).toBe('Hello World')
    })

    it('should handle multiple spaces', () => {
      expect(titleCase('hello   world')).toBe('Hello   World')
    })

    it('should handle single word', () => {
      expect(titleCase('hello')).toBe('Hello')
      expect(titleCase('Hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(titleCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(titleCase(null as any)).toBe('')
      expect(titleCase(undefined as any)).toBe('')
    })
  })

  describe('sentenceCase', () => {
    it('should convert to sentence case', () => {
      expect(sentenceCase('hello world')).toBe('Hello world')
      expect(sentenceCase('HELLO WORLD')).toBe('Hello world')
    })

    it('should handle multiple sentences', () => {
      expect(sentenceCase('hello. world. test.')).toBe('Hello. World. Test.')
      expect(sentenceCase('hello. WORLD. test.')).toBe('Hello. World. Test.')
    })

    it('should handle mixed case', () => {
      expect(sentenceCase('hELLO wORLD')).toBe('Hello world')
    })

    it('should handle single word', () => {
      expect(sentenceCase('hello')).toBe('Hello')
      expect(sentenceCase('Hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(sentenceCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(sentenceCase(null as any)).toBe('')
      expect(sentenceCase(undefined as any)).toBe('')
    })
  })

  describe('reverse', () => {
    it('should reverse string', () => {
      expect(reverse('hello')).toBe('olleh')
      expect(reverse('world')).toBe('dlrow')
      expect(reverse('12345')).toBe('54321')
    })

    it('should handle empty string', () => {
      expect(reverse('')).toBe('')
    })

    it('should handle single character', () => {
      expect(reverse('a')).toBe('a')
    })

    it('should handle null/undefined input', () => {
      expect(reverse(null as any)).toBe('')
      expect(reverse(undefined as any)).toBe('')
    })
  })

  describe('truncate', () => {
    it('should truncate string to specified length', () => {
      expect(truncate('Hello world', 5)).toBe('Hello...')
      expect(truncate('This is a long string', 10)).toBe('This is a...')
    })

    it('should not truncate if string is shorter than limit', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
      expect(truncate('Hi', 5)).toBe('Hi')
    })

    it('should use custom suffix', () => {
      expect(truncate('Hello world', 5, '***')).toBe('Hello***')
      expect(truncate('Long string', 8, ' [more]')).toBe('Long str [more]')
    })

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(truncate(null as any, 10)).toBe('')
      expect(truncate(undefined as any, 10)).toBe('')
    })

    it('should handle invalid length', () => {
      expect(truncate('Hello', 0)).toBe('...')
      expect(truncate('Hello', -5)).toBe('...')
    })
  })

  describe('padLeft', () => {
    it('should pad string on the left', () => {
      expect(padLeft('hello', 10)).toBe('     hello')
      expect(padLeft('123', 5, '0')).toBe('00123')
    })

    it('should handle custom padding character', () => {
      expect(padLeft('hello', 8, '*')).toBe('***hello')
      expect(padLeft('test', 6, '-')).toBe('--test')
    })

    it('should handle when string is already longer than length', () => {
      expect(padLeft('hello world', 5)).toBe('hello world')
    })

    it('should handle empty string', () => {
      expect(padLeft('', 5)).toBe('     ')
    })

    it('should handle null/undefined input', () => {
      expect(padLeft(null as any, 5)).toBe('     ')
      expect(padLeft(undefined as any, 5)).toBe('     ')
    })
  })

  describe('padRight', () => {
    it('should pad string on the right', () => {
      expect(padRight('hello', 10)).toBe('hello     ')
      expect(padRight('123', 5, '0')).toBe('12300')
    })

    it('should handle custom padding character', () => {
      expect(padRight('hello', 8, '*')).toBe('hello***')
      expect(padRight('test', 6, '-')).toBe('test--')
    })

    it('should handle when string is already longer than length', () => {
      expect(padRight('hello world', 5)).toBe('hello world')
    })

    it('should handle empty string', () => {
      expect(padRight('', 5)).toBe('     ')
    })

    it('should handle null/undefined input', () => {
      expect(padRight(null as any, 5)).toBe('     ')
      expect(padRight(undefined as any, 5)).toBe('     ')
    })
  })

  describe('trim', () => {
    it('should trim whitespace from both ends', () => {
      expect(trim('  hello  ')).toBe('hello')
      expect(trim('\t\nhello\r\n')).toBe('hello')
      expect(trim('  hello world  ')).toBe('hello world')
    })

    it('should handle custom characters', () => {
      expect(trim('***hello***', '*')).toBe('hello')
      expect(trim('--hello--', '-')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(trim('')).toBe('')
    })

    it('should handle string with only whitespace', () => {
      expect(trim('   ')).toBe('')
      expect(trim('\t\n\r')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(trim(null as any)).toBe('')
      expect(trim(undefined as any)).toBe('')
    })
  })

  describe('trimLeft', () => {
    it('should trim whitespace from left end', () => {
      expect(trimLeft('  hello  ')).toBe('hello  ')
      expect(trimLeft('\t\nhello\r\n')).toBe('hello\r\n')
    })

    it('should handle custom characters', () => {
      expect(trimLeft('***hello***', '*')).toBe('hello***')
      expect(trimLeft('--hello--', '-')).toBe('hello--')
    })

    it('should handle empty string', () => {
      expect(trimLeft('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(trimLeft(null as any)).toBe('')
      expect(trimLeft(undefined as any)).toBe('')
    })
  })

  describe('trimRight', () => {
    it('should trim whitespace from right end', () => {
      expect(trimRight('  hello  ')).toBe('  hello')
      expect(trimRight('\t\nhello\r\n')).toBe('\t\nhello')
    })

    it('should handle custom characters', () => {
      expect(trimRight('***hello***', '*')).toBe('***hello')
      expect(trimRight('--hello--', '-')).toBe('--hello')
    })

    it('should handle empty string', () => {
      expect(trimRight('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(trimRight(null as any)).toBe('')
      expect(trimRight(undefined as any)).toBe('')
    })
  })

  describe('removeWhitespace', () => {
    it('should remove all whitespace', () => {
      expect(removeWhitespace('hello world')).toBe('helloworld')
      expect(removeWhitespace('  hello  world  ')).toBe('helloworld')
      expect(removeWhitespace('hello\nworld\ttest')).toBe('helloworldtest')
    })

    it('should handle empty string', () => {
      expect(removeWhitespace('')).toBe('')
    })

    it('should handle string with only whitespace', () => {
      expect(removeWhitespace('   ')).toBe('')
      expect(removeWhitespace('\t\n\r')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(removeWhitespace(null as any)).toBe('')
      expect(removeWhitespace(undefined as any)).toBe('')
    })
  })

  describe('removeSpecialChars', () => {
    it('should remove special characters', () => {
      expect(removeSpecialChars('hello@world!')).toBe('helloworld')
      expect(removeSpecialChars('test#123$abc')).toBe('test123abc')
      expect(removeSpecialChars('normal_text')).toBe('normaltext')
    })

    it('should preserve alphanumeric characters', () => {
      expect(removeSpecialChars('hello123')).toBe('hello123')
      expect(removeSpecialChars('HelloWorld')).toBe('HelloWorld')
    })

    it('should handle empty string', () => {
      expect(removeSpecialChars('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(removeSpecialChars(null as any)).toBe('')
      expect(removeSpecialChars(undefined as any)).toBe('')
    })
  })

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<div>hello</div>')).toBe('&lt;div&gt;hello&lt;/div&gt;')
      expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
      expect(escapeHtml("'hello'")).toBe('&#x27;hello&#x27;')
      expect(escapeHtml('&hello&')).toBe('&amp;hello&amp;')
    })

    it('should handle mixed content', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    })

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(escapeHtml(null as any)).toBe('')
      expect(escapeHtml(undefined as any)).toBe('')
    })
  })

  describe('unescapeHtml', () => {
    it('should unescape HTML special characters', () => {
      expect(unescapeHtml('&lt;div&gt;hello&lt;/div&gt;')).toBe('<div>hello</div>')
      expect(unescapeHtml('&quot;hello&quot;')).toBe('"hello"')
      expect(unescapeHtml('&#x27;hello&#x27;')).toBe("'hello'")
      expect(unescapeHtml('&amp;hello&amp;')).toBe('&hello&')
    })

    it('should handle mixed content', () => {
      expect(unescapeHtml('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')).toBe('<script>alert("xss")</script>')
    })

    it('should handle empty string', () => {
      expect(unescapeHtml('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(unescapeHtml(null as any)).toBe('')
      expect(unescapeHtml(undefined as any)).toBe('')
    })
  })

  describe('escapeRegex', () => {
    it('should escape regex special characters', () => {
      expect(escapeRegex('hello.world')).toBe('hello\.world')
      expect(escapeRegex('test+123*abc')).toBe('test\+123\*abc')
      expect(escapeRegex('normal?text')).toBe('normal\?text')
    })

    it('should handle complex patterns', () => {
      expect(escapeRegex('^test[123]{1,3}$')).toBe('\^test\[123\]\{1,3\}\$')
    })

    it('should handle empty string', () => {
      expect(escapeRegex('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(escapeRegex(null as any)).toBe('')
      expect(escapeRegex(undefined as any)).toBe('')
    })
  })

  describe('slugify', () => {
    it('should create URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Hello World Test')).toBe('hello-world-test')
      expect(slugify('Special@Chars#Here')).toBe('special-chars-here')
    })

    it('should handle multiple spaces and separators', () => {
      expect(slugify('hello   world')).toBe('hello-world')
      expect(slugify('hello--world')).toBe('hello-world')
      expect(slugify('hello__world')).toBe('hello-world')
    })

    it('should handle empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(slugify(null as any)).toBe('')
      expect(slugify(undefined as any)).toBe('')
    })
  })

  describe('pluralize', () => {
    it('should pluralize common words', () => {
      expect(pluralize('cat')).toBe('cats')
      expect(pluralize('dog')).toBe('dogs')
      expect(pluralize('house')).toBe('houses')
      expect(pluralize('box')).toBe('boxes')
      expect(pluralize('baby')).toBe('babies')
    })

    it('should handle irregular plurals', () => {
      expect(pluralize('person')).toBe('people')
      expect(pluralize('child')).toBe('children')
      expect(pluralize('man')).toBe('men')
      expect(pluralize('woman')).toBe('women')
    })

    it('should handle count parameter', () => {
      expect(pluralize('cat', 1)).toBe('cat')
      expect(pluralize('cat', 2)).toBe('cats')
      expect(pluralize('cat', 0)).toBe('cats')
    })

    it('should handle empty string', () => {
      expect(pluralize('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(pluralize(null as any)).toBe('')
      expect(pluralize(undefined as any)).toBe('')
    })
  })

  describe('singularize', () => {
    it('should singularize common words', () => {
      expect(singularize('cats')).toBe('cat')
      expect(singularize('dogs')).toBe('dog')
      expect(singularize('houses')).toBe('house')
      expect(singularize('boxes')).toBe('box')
      expect(singularize('babies')).toBe('baby')
    })

    it('should handle irregular singulars', () => {
      expect(singularize('people')).toBe('person')
      expect(singularize('children')).toBe('child')
      expect(singularize('men')).toBe('man')
      expect(singularize('women')).toBe('woman')
    })

    it('should handle already singular words', () => {
      expect(singularize('cat')).toBe('cat')
      expect(singularize('dog')).toBe('dog')
    })

    it('should handle empty string', () => {
      expect(singularize('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(singularize(null as any)).toBe('')
      expect(singularize(undefined as any)).toBe('')
    })
  })

  describe('camelize', () => {
    it('should convert to camelCase', () => {
      expect(camelize('hello_world')).toBe('helloWorld')
      expect(camelize('hello-world')).toBe('helloWorld')
      expect(camelize('hello world')).toBe('helloWorld')
    })

    it('should handle already camelCase', () => {
      expect(camelize('helloWorld')).toBe('helloWorld')
    })

    it('should handle empty string', () => {
      expect(camelize('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(camelize(null as any)).toBe('')
      expect(camelize(undefined as any)).toBe('')
    })
  })

  describe('underscore', () => {
    it('should convert to underscore_case', () => {
      expect(underscore('helloWorld')).toBe('hello_world')
      expect(underscore('hello-world')).toBe('hello_world')
      expect(underscore('hello world')).toBe('hello_world')
    })

    it('should handle already underscore_case', () => {
      expect(underscore('hello_world')).toBe('hello_world')
    })

    it('should handle empty string', () => {
      expect(underscore('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(underscore(null as any)).toBe('')
      expect(underscore(undefined as any)).toBe('')
    })
  })

  describe('dasherize', () => {
    it('should convert to dash-case', () => {
      expect(dasherize('helloWorld')).toBe('hello-world')
      expect(dasherize('hello_world')).toBe('hello-world')
      expect(dasherize('hello world')).toBe('hello-world')
    })

    it('should handle already dash-case', () => {
      expect(dasherize('hello-world')).toBe('hello-world')
    })

    it('should handle empty string', () => {
      expect(dasherize('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(dasherize(null as any)).toBe('')
      expect(dasherize(undefined as any)).toBe('')
    })
  })

  describe('humanize', () => {
    it('should convert to human readable format', () => {
      expect(humanize('hello_world')).toBe('Hello world')
      expect(humanize('hello-world')).toBe('Hello world')
      expect(humanize('helloWorld')).toBe('Hello world')
    })

    it('should handle already humanized', () => {
      expect(humanize('Hello world')).toBe('Hello world')
    })

    it('should handle empty string', () => {
      expect(humanize('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(humanize(null as any)).toBe('')
      expect(humanize(undefined as any)).toBe('')
    })
  })

  describe('parameterize', () => {
    it('should create URL parameter', () => {
      expect(parameterize('Hello World')).toBe('hello-world')
      expect(parameterize('Special@Chars#Here')).toBe('special-chars-here')
    })

    it('should handle multiple spaces', () => {
      expect(parameterize('hello   world')).toBe('hello-world')
    })

    it('should handle empty string', () => {
      expect(parameterize('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(parameterize(null as any)).toBe('')
      expect(parameterize(undefined as any)).toBe('')
    })
  })

  describe('classify', () => {
    it('should convert to class name', () => {
      expect(classify('hello_world')).toBe('HelloWorld')
      expect(classify('hello-world')).toBe('HelloWorld')
      expect(classify('hello world')).toBe('HelloWorld')
    })

    it('should handle already classified', () => {
      expect(classify('HelloWorld')).toBe('HelloWorld')
    })

    it('should handle empty string', () => {
      expect(classify('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(classify(null as any)).toBe('')
      expect(classify(undefined as any)).toBe('')
    })
  })

  describe('foreignKey', () => {
    it('should create foreign key name', () => {
      expect(foreignKey('User')).toBe('user_id')
      expect(foreignKey('Post')).toBe('post_id')
      expect(foreignKey('Comment')).toBe('comment_id')
    })

    it('should handle custom suffix', () => {
      expect(foreignKey('User', 'uid')).toBe('user_uid')
      expect(foreignKey('Post', 'post_id')).toBe('post_post_id')
    })

    it('should handle empty string', () => {
      expect(foreignKey('')).toBe('_id')
    })

    it('should handle null/undefined input', () => {
      expect(foreignKey(null as any)).toBe('_id')
      expect(foreignKey(undefined as any)).toBe('_id')
    })
  })

  describe('ordinalize', () => {
    it('should add ordinal suffix', () => {
      expect(ordinalize(1)).toBe('1st')
      expect(ordinalize(2)).toBe('2nd')
      expect(ordinalize(3)).toBe('3rd')
      expect(ordinalize(4)).toBe('4th')
      expect(ordinalize(11)).toBe('11th')
      expect(ordinalize(12)).toBe('12th')
      expect(ordinalize(13)).toBe('13th')
      expect(ordinalize(21)).toBe('21st')
      expect(ordinalize(22)).toBe('22nd')
      expect(ordinalize(23)).toBe('23rd')
      expect(ordinalize(24)).toBe('24th')
    })

    it('should handle string numbers', () => {
      expect(ordinalize('1')).toBe('1st')
      expect(ordinalize('2')).toBe('2nd')
      expect(ordinalize('3')).toBe('3rd')
    })

    it('should handle empty string', () => {
      expect(ordinalize('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(ordinalize(null as any)).toBe('')
      expect(ordinalize(undefined as any)).toBe('')
    })
  })

  describe('interpolate', () => {
    it('should interpolate template with object', () => {
      expect(interpolate('Hello ${name}!', { name: 'World' })).toBe('Hello World!')
      expect(interpolate('The ${animal} jumps over the ${object}', { animal: 'fox', object: 'fence' })).toBe('The fox jumps over the fence')
    })

    it('should handle missing properties', () => {
      expect(interpolate('Hello ${name}!', {})).toBe('Hello !')
      expect(interpolate('Hello ${name} ${lastName}!', { name: 'John' })).toBe('Hello John !')
    })

    it('should handle empty template', () => {
      expect(interpolate('', { name: 'World' })).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(interpolate(null as any, { name: 'World' })).toBe('')
      expect(interpolate(undefined as any, { name: 'World' })).toBe('')
    })
  })

  describe('repeat', () => {
    it('should repeat string', () => {
      expect(repeat('hello', 3)).toBe('hellohellohello')
      expect(repeat('abc', 2)).toBe('abcabc')
    })

    it('should handle zero count', () => {
      expect(repeat('hello', 0)).toBe('')
    })

    it('should handle negative count', () => {
      expect(repeat('hello', -1)).toBe('')
    })

    it('should handle empty string', () => {
      expect(repeat('', 5)).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(repeat(null as any, 3)).toBe('')
      expect(repeat(undefined as any, 3)).toBe('')
    })
  })

  describe('count', () => {
    it('should count characters in string', () => {
      expect(count('hello')).toBe(5)
      expect(count('hello world')).toBe(11)
      expect(count('')).toBe(0)
    })

    it('should handle null/undefined input', () => {
      expect(count(null as any)).toBe(0)
      expect(count(undefined as any)).toBe(0)
    })
  })

  describe('countWords', () => {
    it('should count words in string', () => {
      expect(countWords('hello world')).toBe(2)
      expect(countWords('hello world test')).toBe(3)
      expect(countWords('hello')).toBe(1)
    })

    it('should handle multiple spaces', () => {
      expect(countWords('hello   world')).toBe(2)
      expect(countWords('  hello  world  ')).toBe(2)
    })

    it('should handle empty string', () => {
      expect(countWords('')).toBe(0)
    })

    it('should handle string with only whitespace', () => {
      expect(countWords('   ')).toBe(0)
    })

    it('should handle null/undefined input', () => {
      expect(countWords(null as any)).toBe(0)
      expect(countWords(undefined as any)).toBe(0)
    })
  })

  describe('countChars', () => {
    it('should count specific characters', () => {
      expect(countChars('hello world', 'l')).toBe(3)
      expect(countChars('hello world', 'o')).toBe(2)
      expect(countChars('hello world', 'z')).toBe(0)
    })

    it('should handle case sensitivity', () => {
      expect(countChars('Hello World', 'h')).toBe(1)
      expect(countChars('Hello World', 'H')).toBe(1)
    })

    it('should handle empty string', () => {
      expect(countChars('', 'a')).toBe(0)
    })

    it('should handle null/undefined input', () => {
      expect(countChars(null as any, 'a')).toBe(0)
      expect(countChars(undefined as any, 'a')).toBe(0)
    })
  })

  describe('countLines', () => {
    it('should count lines in string', () => {
      expect(countLines('hello\nworld')).toBe(2)
      expect(countLines('hello\nworld\ntest')).toBe(3)
      expect(countLines('hello')).toBe(1)
    })

    it('should handle different line endings', () => {
      expect(countLines('hello\r\nworld')).toBe(2)
      expect(countLines('hello\rworld')).toBe(2)
    })

    it('should handle empty string', () => {
      expect(countLines('')).toBe(0)
    })

    it('should handle trailing newlines', () => {
      expect(countLines('hello\nworld\n')).toBe(2)
    })

    it('should handle null/undefined input', () => {
      expect(countLines(null as any)).toBe(0)
      expect(countLines(undefined as any)).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true)
    })

    it('should return false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty(' ')).toBe(false)
      expect(isEmpty('\t')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isEmpty(null as any)).toBe(true)
      expect(isEmpty(undefined as any)).toBe(true)
    })
  })

  describe('isBlank', () => {
    it('should return true for blank string', () => {
      expect(isBlank('')).toBe(true)
      expect(isBlank(' ')).toBe(true)
      expect(isBlank('\t')).toBe(true)
      expect(isBlank('\n')).toBe(true)
    })

    it('should return false for non-blank string', () => {
      expect(isBlank('hello')).toBe(false)
      expect(isBlank(' hello ')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isBlank(null as any)).toBe(true)
      expect(isBlank(undefined as any)).toBe(true)
    })
  })

  describe('isNotEmpty', () => {
    it('should return true for non-empty string', () => {
      expect(isNotEmpty('hello')).toBe(true)
      expect(isNotEmpty(' ')).toBe(true)
      expect(isNotEmpty('\t')).toBe(true)
    })

    it('should return false for empty string', () => {
      expect(isNotEmpty('')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isNotEmpty(null as any)).toBe(false)
      expect(isNotEmpty(undefined as any)).toBe(false)
    })
  })

  describe('isNotBlank', () => {
    it('should return true for non-blank string', () => {
      expect(isNotBlank('hello')).toBe(true)
      expect(isNotBlank(' hello ')).toBe(true)
    })

    it('should return false for blank string', () => {
      expect(isNotBlank('')).toBe(false)
      expect(isNotBlank(' ')).toBe(false)
      expect(isNotBlank('\t')).toBe(false)
      expect(isNotBlank('\n')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isNotBlank(null as any)).toBe(false)
      expect(isNotBlank(undefined as any)).toBe(false)
    })
  })

  describe('includes', () => {
    it('should check if string includes substring', () => {
      expect(includes('hello world', 'world')).toBe(true)
      expect(includes('hello world', 'hello')).toBe(true)
      expect(includes('hello world', 'test')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      expect(includes('Hello World', 'hello')).toBe(false)
      expect(includes('Hello World', 'Hello')).toBe(true)
    })

    it('should handle empty string', () => {
      expect(includes('', 'test')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(includes(null as any, 'test')).toBe(false)
      expect(includes(undefined as any, 'test')).toBe(false)
    })
  })

  describe('startsWith', () => {
    it('should check if string starts with prefix', () => {
      expect(startsWith('hello world', 'hello')).toBe(true)
      expect(startsWith('hello world', 'world')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      expect(startsWith('Hello world', 'hello')).toBe(false)
      expect(startsWith('Hello world', 'Hello')).toBe(true)
    })

    it('should handle empty string', () => {
      expect(startsWith('', 'test')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(startsWith(null as any, 'test')).toBe(false)
      expect(startsWith(undefined as any, 'test')).toBe(false)
    })
  })

  describe('endsWith', () => {
    it('should check if string ends with suffix', () => {
      expect(endsWith('hello world', 'world')).toBe(true)
      expect(endsWith('hello world', 'hello')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      expect(endsWith('hello World', 'world')).toBe(false)
      expect(endsWith('hello World', 'World')).toBe(true)
    })

    it('should handle empty string', () => {
      expect(endsWith('', 'test')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(endsWith(null as any, 'test')).toBe(false)
      expect(endsWith(undefined as any, 'test')).toBe(false)
    })
  })

  describe('contains', () => {
    it('should check if string contains substring', () => {
      expect(contains('hello world', 'world')).toBe(true)
      expect(contains('hello world', 'hello')).toBe(true)
      expect(contains('hello world', 'test')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      expect(contains('Hello World', 'hello')).toBe(false)
      expect(contains('Hello World', 'Hello')).toBe(true)
    })

    it('should handle empty string', () => {
      expect(contains('', 'test')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(contains(null as any, 'test')).toBe(false)
      expect(contains(undefined as any, 'test')).toBe(false)
    })
  })

  describe('matches', () => {
    it('should check if string matches pattern', () => {
      expect(matches('hello world', /hello/)).toBe(true)
      expect(matches('hello world', /world/)).toBe(true)
      expect(matches('hello world', /test/)).toBe(false)
    })

    it('should handle complex patterns', () => {
      expect(matches('123-456-7890', /^\d{3}-\d{3}-\d{4}$/)).toBe(true)
      expect(matches('test@example.com', /^[^\s@]+@[^\s@]+\.[^\s@]+$/)).toBe(true)
    })

    it('should handle empty string', () => {
      expect(matches('', /test/)).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(matches(null as any, /test/)).toBe(false)
      expect(matches(undefined as any, /test/)).toBe(false)
    })
  })

  describe('replace', () => {
    it('should replace first occurrence', () => {
      expect(replace('hello world', 'world', 'universe')).toBe('hello universe')
      expect(replace('hello hello hello', 'hello', 'hi')).toBe('hi hello hello')
    })

    it('should handle regex replacement', () => {
      expect(replace('hello world', /hello/, 'hi')).toBe('hi world')
    })

    it('should handle empty string', () => {
      expect(replace('', 'test', 'replace')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(replace(null as any, 'test', 'replace')).toBe('')
      expect(replace(undefined as any, 'test', 'replace')).toBe('')
    })
  })

  describe('replaceAll', () => {
    it('should replace all occurrences', () => {
      expect(replaceAll('hello hello hello', 'hello', 'hi')).toBe('hi hi hi')
      expect(replaceAll('hello world hello world', 'world', 'universe')).toBe('hello universe hello universe')
    })

    it('should handle regex replacement', () => {
      expect(replaceAll('hello hello hello', /hello/g, 'hi')).toBe('hi hi hi')
    })

    it('should handle empty string', () => {
      expect(replaceAll('', 'test', 'replace')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(replaceAll(null as any, 'test', 'replace')).toBe('')
      expect(replaceAll(undefined as any, 'test', 'replace')).toBe('')
    })
  })

  describe('split', () => {
    it('should split string by separator', () => {
      expect(split('hello world', ' ')).toEqual(['hello', 'world'])
      expect(split('hello,world,test', ',')).toEqual(['hello', 'world', 'test'])
    })

    it('should handle regex separator', () => {
      expect(split('hello   world', /\s+/)).toEqual(['hello', 'world'])
    })

    it('should handle empty string', () => {
      expect(split('', ' ')).toEqual([''])
    })

    it('should handle null/undefined input', () => {
      expect(split(null as any, ' ')).toEqual([])
      expect(split(undefined as any, ' ')).toEqual([])
    })
  })

  describe('join', () => {
    it('should join array with separator', () => {
      expect(join(['hello', 'world'], ' ')).toBe('hello world')
      expect(join(['hello', 'world', 'test'], ', ')).toBe('hello,world,test')
    })

    it('should handle empty array', () => {
      expect(join([], ' ')).toBe('')
    })

    it('should handle single element array', () => {
      expect(join(['hello'], ' ')).toBe('hello')
    })

    it('should handle null/undefined input', () => {
      expect(join(null as any, ' ')).toBe('')
      expect(join(undefined as any, ' ')).toBe('')
    })
  })

  describe('slice', () => {
    it('should slice string', () => {
      expect(slice('hello world', 0, 5)).toBe('hello')
      expect(slice('hello world', 6)).toBe('world')
      expect(slice('hello world', -5)).toBe('world')
    })

    it('should handle out of bounds', () => {
      expect(slice('hello', 10)).toBe('')
      expect(slice('hello', 0, 10)).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(slice('', 0, 5)).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(slice(null as any, 0, 5)).toBe('')
      expect(slice(undefined as any, 0, 5)).toBe('')
    })
  })

  describe('substring', () => {
    it('should get substring', () => {
      expect(substring('hello world', 0, 5)).toBe('hello')
      expect(substring('hello world', 6)).toBe('world')
    })

    it('should handle negative indices', () => {
      expect(substring('hello world', -5)).toBe('hello world')
    })

    it('should handle out of bounds', () => {
      expect(substring('hello', 10)).toBe('')
      expect(substring('hello', 0, 10)).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(substring('', 0, 5)).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(substring(null as any, 0, 5)).toBe('')
      expect(substring(undefined as any, 0, 5)).toBe('')
    })
  })

  describe('substr', () => {
    it('should get substring', () => {
      expect(substr('hello world', 0, 5)).toBe('hello')
      expect(substr('hello world', 6, 5)).toBe('world')
    })

    it('should handle negative start', () => {
      expect(substr('hello world', -5, 5)).toBe('world')
    })

    it('should handle out of bounds', () => {
      expect(substr('hello', 10, 5)).toBe('')
      expect(substr('hello', 0, 10)).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(substr('', 0, 5)).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(substr(null as any, 0, 5)).toBe('')
      expect(substr(undefined as any, 0, 5)).toBe('')
    })
  })

  describe('toLowerCase', () => {
    it('should convert to lowercase', () => {
      expect(toLowerCase('HELLO')).toBe('hello')
      expect(toLowerCase('Hello World')).toBe('hello world')
    })

    it('should handle empty string', () => {
      expect(toLowerCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(toLowerCase(null as any)).toBe('')
      expect(toLowerCase(undefined as any)).toBe('')
    })
  })

  describe('toUpperCase', () => {
    it('should convert to uppercase', () => {
      expect(toUpperCase('hello')).toBe('HELLO')
      expect(toUpperCase('Hello World')).toBe('HELLO WORLD')
    })

    it('should handle empty string', () => {
      expect(toUpperCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(toUpperCase(null as any)).toBe('')
      expect(toUpperCase(undefined as any)).toBe('')
    })
  })

  describe('toLocaleLowerCase', () => {
    it('should convert to locale lowercase', () => {
      expect(toLocaleLowerCase('HELLO')).toBe('hello')
      expect(toLocaleLowerCase('Hello World')).toBe('hello world')
    })

    it('should handle custom locale', () => {
      expect(toLocaleLowerCase('HELLO', 'tr')).toBe('hello')
    })

    it('should handle empty string', () => {
      expect(toLocaleLowerCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(toLocaleLowerCase(null as any)).toBe('')
      expect(toLocaleLowerCase(undefined as any)).toBe('')
    })
  })

  describe('toLocaleUpperCase', () => {
    it('should convert to locale uppercase', () => {
      expect(toLocaleUpperCase('hello')).toBe('HELLO')
      expect(toLocaleUpperCase('Hello World')).toBe('HELLO WORLD')
    })

    it('should handle custom locale', () => {
      expect(toLocaleUpperCase('hello', 'tr')).toBe('HELLO')
    })

    it('should handle empty string', () => {
      expect(toLocaleUpperCase('')).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(toLocaleUpperCase(null as any)).toBe('')
      expect(toLocaleUpperCase(undefined as any)).toBe('')
    })
  })

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld')
      expect(toCamelCase('hello-world')).toBe('helloWorld')
      expect(toCamelCase('hello world')).toBe('helloWorld')
    })

    it('should handle edge cases', () => {
      expect(toCamelCase('')).toBe('')
      expect(toCamelCase(null as any)).toBe('')
      expect(toCamelCase(undefined as any)).toBe('')
    })
  })

  describe('toSnakeCase', () => {
    it('should convert to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world')
      expect(toSnakeCase('hello-world')).toBe('hello_world')
      expect(toSnakeCase('hello world')).toBe('hello_world')
    })

    it('should handle edge cases', () => {
      expect(toSnakeCase('')).toBe('')
      expect(toSnakeCase(null as any)).toBe('')
      expect(toSnakeCase(undefined as any)).toBe('')
    })
  })

  describe('toKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world')
      expect(toKebabCase('hello_world')).toBe('hello-world')
      expect(toKebabCase('hello world')).toBe('hello-world')
    })

    it('should handle edge cases', () => {
      expect(toKebabCase('')).toBe('')
      expect(toKebabCase(null as any)).toBe('')
      expect(toKebabCase(undefined as any)).toBe('')
    })
  })

  describe('toPascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(toPascalCase('hello_world')).toBe('HelloWorld')
      expect(toPascalCase('hello-world')).toBe('HelloWorld')
      expect(toPascalCase('hello world')).toBe('HelloWorld')
    })

    it('should handle edge cases', () => {
      expect(toPascalCase('')).toBe('')
      expect(toPascalCase(null as any)).toBe('')
      expect(toPascalCase(undefined as any)).toBe('')
    })
  })

  describe('toTitleCase', () => {
    it('should convert to Title Case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World')
      expect(toTitleCase('hello world test')).toBe('Hello World Test')
    })

    it('should handle edge cases', () => {
      expect(toTitleCase('')).toBe('')
      expect(toTitleCase(null as any)).toBe('')
      expect(toTitleCase(undefined as any)).toBe('')
    })
  })

  describe('toSentenceCase', () => {
    it('should convert to sentence case', () => {
      expect(toSentenceCase('hello world')).toBe('Hello world')
      expect(toSentenceCase('HELLO WORLD')).toBe('Hello world')
    })

    it('should handle edge cases', () => {
      expect(toSentenceCase('')).toBe('')
      expect(toSentenceCase(null as any)).toBe('')
      expect(toSentenceCase(undefined as any)).toBe('')
    })
  })

  describe('toLowerCaseFirst', () => {
    it('should convert first character to lowercase', () => {
      expect(toLowerCaseFirst('Hello')).toBe('hello')
      expect(toLowerCaseFirst('HELLO')).toBe('hELLO')
    })

    it('should handle edge cases', () => {
      expect(toLowerCaseFirst('')).toBe('')
      expect(toLowerCaseFirst('h')).toBe('h')
      expect(toLowerCaseFirst(null as any)).toBe('')
      expect(toLowerCaseFirst(undefined as any)).toBe('')
    })
  })

  describe('toUpperCaseFirst', () => {
    it('should convert first character to uppercase', () => {
      expect(toUpperCaseFirst('hello')).toBe('Hello')
      expect(toUpperCaseFirst('hello world')).toBe('Hello world')
    })

    it('should handle edge cases', () => {
      expect(toUpperCaseFirst('')).toBe('')
      expect(toUpperCaseFirst('H')).toBe('H')
      expect(toUpperCaseFirst(null as any)).toBe('')
      expect(toUpperCaseFirst(undefined as any)).toBe('')
    })
  })

  describe('reverseString', () => {
    it('should reverse string', () => {
      expect(reverseString('hello')).toBe('olleh')
      expect(reverseString('world')).toBe('dlrow')
    })

    it('should handle edge cases', () => {
      expect(reverseString('')).toBe('')
      expect(reverseString('a')).toBe('a')
      expect(reverseString(null as any)).toBe('')
      expect(reverseString(undefined as any)).toBe('')
    })
  })

  describe('truncateString', () => {
    it('should truncate string', () => {
      expect(truncateString('Hello world', 5)).toBe('Hello...')
      expect(truncateString('This is a long string', 10)).toBe('This is a...')
    })

    it('should handle edge cases', () => {
      expect(truncateString('', 10)).toBe('')
      expect(truncateString('Hello', 10)).toBe('Hello')
      expect(truncateString(null as any, 10)).toBe('')
      expect(truncateString(undefined as any, 10)).toBe('')
    })
  })

  describe('padString', () => {
    it('should pad string', () => {
      expect(padString('hello', 10)).toBe('     hello')
      expect(padString('hello', 10, '0')).toBe('00000hello')
    })

    it('should handle edge cases', () => {
      expect(padString('', 5)).toBe('     ')
      expect(padString('hello', 3)).toBe('hello')
      expect(padString(null as any, 5)).toBe('     ')
      expect(padString(undefined as any, 5)).toBe('     ')
    })
  })

  describe('trimString', () => {
    it('should trim string', () => {
      expect(trimString('  hello  ')).toBe('hello')
      expect(trimString('\t\nhello\r\n')).toBe('hello')
    })

    it('should handle edge cases', () => {
      expect(trimString('')).toBe('')
      expect(trimString('   ')).toBe('')
      expect(trimString(null as any)).toBe('')
      expect(trimString(undefined as any)).toBe('')
    })
  })

  describe('escapeString', () => {
    it('should escape string', () => {
      expect(escapeString('hello"world')).toBe('hello\"world')
      expect(escapeString('hello\\world')).toBe('hello\\\\world')
    })

    it('should handle edge cases', () => {
      expect(escapeString('')).toBe('')
      expect(escapeString(null as any)).toBe('')
      expect(escapeString(undefined as any)).toBe('')
    })
  })

  describe('unescapeString', () => {
    it('should unescape string', () => {
      expect(unescapeString('hello\"world')).toBe('hello"world')
      expect(unescapeString('hello\\\\world')).toBe('hello\\world')
    })

    it('should handle edge cases', () => {
      expect(unescapeString('')).toBe('')
      expect(unescapeString(null as any)).toBe('')
      expect(unescapeString(undefined as any)).toBe('')
    })
  })

  describe('slugifyString', () => {
    it('should create slug', () => {
      expect(slugifyString('Hello World')).toBe('hello-world')
      expect(slugifyString('Special@Chars#Here')).toBe('special-chars-here')
    })

    it('should handle edge cases', () => {
      expect(slugifyString('')).toBe('')
      expect(slugifyString(null as any)).toBe('')
      expect(slugifyString(undefined as any)).toBe('')
    })
  })

  describe('pluralizeString', () => {
    it('should pluralize string', () => {
      expect(pluralizeString('cat')).toBe('cats')
      expect(pluralizeString('dog')).toBe('dogs')
    })

    it('should handle edge cases', () => {
      expect(pluralizeString('')).toBe('')
      expect(pluralizeString(null as any)).toBe('')
      expect(pluralizeString(undefined as any)).toBe('')
    })
  })

  describe('singularizeString', () => {
    it('should singularize string', () => {
      expect(singularizeString('cats')).toBe('cat')
      expect(singularizeString('dogs')).toBe('dog')
    })

    it('should handle edge cases', () => {
      expect(singularizeString('')).toBe('')
      expect(singularizeString(null as any)).toBe('')
      expect(singularizeString(undefined as any)).toBe('')
    })
  })

  describe('formatString', () => {
    it('should format string with arguments', () => {
      expect(formatString('Hello {0}!', 'World')).toBe('Hello World!')
      expect(formatString('The {0} jumps over the {1}', 'fox', 'fence')).toBe('The fox jumps over the fence')
    })

    it('should handle missing arguments', () => {
      expect(formatString('Hello {0}!')).toBe('Hello {0}!')
      expect(formatString('Hello {0} {1}!', 'John')).toBe('Hello John {1}!')
    })

    it('should handle edge cases', () => {
      expect(formatString('', 'World')).toBe('')
      expect(formatString(null as any, 'World')).toBe('')
      expect(formatString(undefined as any, 'World')).toBe('')
    })
  })

  describe('template', () => {
    it('should create template function', () => {
      const templateFn = template('Hello ${name}!')
      expect(templateFn({ name: 'World' })).toBe('Hello World!')
    })

    it('should handle complex templates', () => {
      const templateFn = template('The ${animal} jumps over the ${object}')
      expect(templateFn({ animal: 'fox', object: 'fence' })).toBe('The fox jumps over the fence')
    })

    it('should handle missing properties', () => {
      const templateFn = template('Hello ${name}!')
      expect(templateFn({})).toBe('Hello !')
    })

    it('should handle edge cases', () => {
      expect(template('')({})).toBe('')
      expect(template(null as any)({})).toBe('')
      expect(template(undefined as any)({})).toBe('')
    })
  })

  describe('Integration Tests', () => {
    it('should work together for complex string processing', () => {
      const input = '  Hello World! This is a TEST.  '
      
      // Clean and process the string
      const cleaned = trimString(input)
      const normalized = toLowerCase(cleaned)
      const words = split(normalized, ' ')
      const processedWords = words.map(word => capitalize(word))
      const result = join(processedWords, ' ')
      
      expect(result).toBe('Hello World! This Is A Test.')
    })

    it('should handle complex data transformation', () => {
      const data = {
        firstName: 'john',
        lastName: 'doe',
        email: 'JOHN.DOE@EXAMPLE.COM',
        phone: '123-456-7890'
      }

      const formatted = {
        name: `${capitalize(data.firstName)} ${capitalize(data.lastName)}`,
        email: toLowerCase(data.email),
        phone: replaceAll(data.phone, '-', ''),
        username: `${toLowerCase(data.firstName)}.${toLowerCase(data.lastName)}`
      }

      expect(formatted.name).toBe('John Doe')
      expect(formatted.email).toBe('john.doe@example.com')
      expect(formatted.phone).toBe('1234567890')
      expect(formatted.username).toBe('john.doe')
    })

    it('should handle template processing with multiple utilities', () => {
      const templateStr = 'Hello ${name}! Your order ${orderId} has been ${status}.'
      const data = {
        name: 'John Doe',
        orderId: '12345',
        status: 'completed'
      }

      const result = template(templateStr)(data)
      expect(result).toBe('Hello John Doe! Your order 12345 has been completed.')

      // Further processing
      const slug = slugifyString(result)
      expect(slug).toBe('hello-john-doe-your-order-12345-has-been-completed')
    })

    it('should handle complex validation and formatting', () => {
      const inputs = [
        '  hello world  ',
        'Hello_World',
        'hello-world',
        'HelloWorld'
      ]

      const processed = inputs.map(input => {
        const trimmed = trimString(input)
        const normalized = toCamelCase(trimmed)
        const capitalized = capitalize(normalized)
        return {
          original: input,
          processed: capitalized
        }
      })

      expect(processed[0].processed).toBe('Hello world')
      expect(processed[1].processed).toBe('Hello world')
      expect(processed[2].processed).toBe('Hello world')
      expect(processed[3].processed).toBe('Hello world')
    })
  })
})