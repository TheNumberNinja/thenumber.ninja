const client = require('../../config/utils/sanityClient.js')
const toHtml = require('@portabletext/to-html').toHTML
const imageUrlBuilder = require('@sanity/image-url')
const builder = imageUrlBuilder(client)

function image(source, width, height) {
  return builder.image(source)
    .auto('format')
    .size(width, height)
    .fit('crop')
}

const portableTextComponents = {
  types: {
    image: ({value: block}) => {
      const image1x = image(block, 720, 440).url()
      const image2x = image(block, 720, 440).dpr(2).url()
      return `<figure class='in-article'>
                <a href='${block.asset.url}' title='View fullsize version of ${block.caption}' target='_blank'>
                  <img src='${image1x}' alt='${image.alt}' srcset='${image2x} 2x' />
                </a>
                <figcaption>${block.caption}</figcaption>
            </figure>`
    },
    table: ({value: block}) => {
      let table = {
        headerRow: [],
        rows: []
      }
      let headerProcessed = false
      block.rows.forEach((row) => {
        if (!headerProcessed) {
          table.headerRow = row.cells
          headerProcessed = true
        } else {
          table.rows.push(row.cells)
        }
      })
      return `<table>
        <thead>
        <tr>
          ${table.headerRow.map((cell) => ['<th>', cell, '</th>'].join('')).join('')}
        </tr>
      </thead>
      <tbody>
        ${table.rows.map((row) => {
        let rowHtml = []
        rowHtml.push('<tr>')

        row.forEach((cell) => {
          rowHtml.push(`<td>${cell}</td>`)
        })

        rowHtml.push('</tr>')

        return rowHtml.join('')
      }).join('')}
      </tbody>
      </table>`
    }
  }
}


async function getPosts() {
  const filter = `*[_type == "post" && !(_id in path("drafts.**"))]|order(date desc) {
		title,
		"slug": slug.current,
		_updatedAt,
		date,
		image,
		summary,
		content[] {
      ...,
      asset->{
        ...,
        "_key": _id
      }
    },
		categories,
		tags
	}`
  return await client.fetch(filter).then(posts => {
    return posts.map(post => {
      post.summary = toHtml(post.summary)
      post.content = toHtml(post.content, {components: portableTextComponents})
      post.image.attribution = toHtml(post.image.attribution)
      post.image.urls = {
        list1x: image(post.image, 360, 220).url(),
        list2x: image(post.image, 360, 220).dpr(2).url(),
        topNavigation1x: image(post.image, 32, 32).url(),
        topNavigation2x: image(post.image, 32, 32).dpr(2).url(),
        page1x: image(post.image, 720, 440).url(),
        page2x: image(post.image, 720, 440).dpr(2).url()
      }
      return post
    })
  }).catch(err => console.error(err))
}

module.exports = getPosts
