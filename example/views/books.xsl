<xsl:template name="books">
	<h1>Books</h1>
   
   <xsl:for-each select="//book">
      <xsl:value-of select="title"/><br/>
   </xsl:for-each>
</xsl:template>