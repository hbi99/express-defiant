<xsl:template name="books">
	<h1>Books</h1>
	<xsl:for-each select="//book">
		<xsl:sort order="ascending" data-type="number" select="price"/>
		<h2><xsl:value-of select="title"/></h2>
		Author: <strong><xsl:value-of select="//author[id = current()/author_id]/name"/></strong><br/>
		Category: <xsl:value-of select="//category[id = current()/category_id]/name"/><br/>
		Price: <xsl:value-of select="price"/>
	</xsl:for-each>
</xsl:template>