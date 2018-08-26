<xsl:template name="index">
	<h1>Books</h1>
	<xsl:for-each select="//book">
		<xsl:sort order="ascending" data-type="number" select="price"/>
		<h2><xsl:value-of select="title"/></h2>
		Author: <strong><xsl:value-of select="author"/></strong><br/>
		Price: <xsl:value-of select="price"/>
	</xsl:for-each>
</xsl:template>