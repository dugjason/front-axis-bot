interface AxisData {
  axis: number
  ra: number
  ie: number
  hs: number
}

export class Front {
  private accessToken: string
  private headers: {
    Authorization: string
    "Content-Type": string
  }

  constructor({ accessToken }: { accessToken: string }) {
    this.accessToken = accessToken
    this.headers = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    }
  }

  /**
   * Fetch a conversation
   * @param conversationId - The ID of the conversation to fetch
   * @returns The conversation data
   */
  async fetchConversation(conversationId: string) {
    const res = await fetch(`https://api2.frontapp.com/conversations/${conversationId}`, {
      headers: this.headers,
    })
    return res.json()
  }

  /**
   * Update a conversation. Specifically applies AXIS Score Custom Fields.
   * !! Ensure you have already created the Custom Fields in Front !!
   * @param conversationId - The ID of the conversation to update
   * @param data - The data to update the conversation with
   */
  async updateConversation(conversationId: string, data: AxisData): Promise<void> {
    await this.sendRequest(
      `/conversations/${conversationId}`,
      "PATCH",
      JSON.stringify({
        custom_fields: {
          "AXIS Score": data.axis,
          "AXIS: RA": data.ra,
          "AXIS: IE": data.ie,
          "AXIS: HS": data.hs,
        },
      }),
    )

    console.log(`Updated conversation ${conversationId}`)
  }

  /**
   * Add a comment to a conversation
   * @param conversationId - The ID of the conversation to add a comment to
   * @param comment - The comment to add to the conversation
   */
  async addComment(conversationId: string, comment: string): Promise<void> {
    await this.sendRequest(
      `/conversations/${conversationId}/comments`,
      "POST",
      JSON.stringify({ body: comment }),
    )
  }

  /**
   * Create a tag.
   * Note Front's API uses a "find or create" strategy, so if the tag already exists with the provided name, it will be returned.
   * @param name - The name of the tag
   * @returns The ID of the created tag
   */
  async createTag(name: string): Promise<string> {
    const response = await this.sendRequest("/tags", "POST", JSON.stringify({ name }))

    return (response as { id: string }).id
  }

  /**
   * Add tags to a conversation
   * @param conversationId - The ID of the conversation to add tags to
   * @param tagIds - An array of tag IDs to add to the conversation
   */
  async addTagsToConversation(conversationId: string, tagIds: Array<string>): Promise<void> {
    await this.sendRequest(
      `/conversations/${conversationId}/tags`,
      "POST",
      JSON.stringify({ tag_ids: tagIds }),
    )
  }

  /**
   * Send a request to the Front API
   * Request wrapper helps handles rate limiting and errors
   * @param path - The path of the request
   * @param method - The method of the request
   * @param body - The body of the request
   * @returns The response from the request
   */
  private async sendRequest(
    path: `/${string}`,
    method: "GET" | "POST" | "PATCH",
    body?: string,
    attempt?: number,
  ): Promise<object> {
    const attempts = attempt ?? 1
    const res = await fetch(`https://api2.frontapp.com${path}`, {
      method,
      headers: this.headers,
      body: body ?? undefined,
    })

    if (!res.ok) {
      if (res.status === 429) {
        // Wait for 3 or more seconds and trys again. Front's API returns a 429 if the rate limit is exceeded.
        await new Promise((resolve) => setTimeout(resolve, 3_000 * attempts))
        return this.sendRequest(path, method, body, attempts + 1)
      }

      throw new Error(`Failed to update conversation: ${res.statusText}`)
    }

    if (res.status === 204) {
      return {
        success: true,
      }
    }

    return await res.json()
  }
}
