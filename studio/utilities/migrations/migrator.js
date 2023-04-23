const client = require('../sanityClient')
const {query, patch} = require(`./${process.argv[2]}`)

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const confirmationMessage = `Running migrations against ${client.config().dataset}\nQuit this script using Ctrl+C if this is not expected\n`


// Taken from https://www.sanity.io/docs/migrating-data
// Run this script from within your project folder in your terminal with: `sanity exec --with-user-token migrations/renameField.js`
//
// This example shows how you may write a migration script that renames a field (name => fullname)
// on a specific document type (author).
// This will migrate documents in batches of 100 and continue patching until no more documents are
// returned from the query.
//
// This script can safely be run, even if documents are being concurrently modified by others.
// If a document gets modified in the time between fetch => submit patch, this script will fail,
// but can safely be re-run multiple times until it eventually runs out of documents to migrate.

// A few things to note:
// - This script will exit if any of the mutations fail due to a revision mismatch (which means the
//   document was edited between fetch => update)
// - The query must eventually return an empty set, or else this script will continue indefinitely

// Fetching documents that matches the precondition for the migration.
// NOTE: This query should eventually return an empty set of documents to mark the migration
// as complete
const fetchDocuments = () =>
  client.fetch(query)

const buildPatches = docs =>
  docs.map(doc => ({
    id: doc._id,
    patch: patch(doc)
  }))

const createTransaction = patches =>
  patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction())

const commitTransaction = tx => tx.commit()

const migrateNextBatch = async () => {
  const documents = await fetchDocuments()
  if (documents.length === 0) {
    console.log('No matching documents found to migrate')
    process.exit(0)
  }

  const patches = buildPatches(documents)
  if (patches.length === 0) {
    console.log('No more documents to migrate!')
    process.exit(0)
  }

  console.log(
    `Migrating batch:\n%s`,
    patches.map(patch => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n')
  )
  const transaction = createTransaction(patches)
  await commitTransaction(transaction)
  return migrateNextBatch()
}

readline.question(confirmationMessage, async () => {
  migrateNextBatch().catch(err => {
    console.error(err)
    process.exit(1)
  })
})

