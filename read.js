const Inquirer = require('inquirer')
const InquirerCommandPrompt = require('inquirer-command-prompt')

Inquirer.registerPrompt('command', InquirerCommandPrompt)

exports.read = ctx => Inquirer.prompt([{
  type: 'command',
  name: 'input',
  message: '>',
  autoCompletion: ctx.autoComplete
}])
