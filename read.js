const Inquirer = require('inquirer')
const InquirerCommandPrompt = require('inquirer-command-prompt')

Inquirer.registerPrompt('command', InquirerCommandPrompt)

exports.read = () => {
  const question = { type: 'command', name: 'input', message: '>' }
  return Inquirer.prompt([question])
}
